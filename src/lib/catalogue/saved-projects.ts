import { createOptionalClient } from '@/lib/supabase/server';
import type { Project } from './types';
import type { ProjectStatus } from '@/lib/supabase/types';
import { mapRowToProject } from './queries';

export interface SavedProjectItem {
  userProjectId: string;
  status: ProjectStatus;
  savedAt: string;
  project: Project;
}

/**
 * Returns a Set of project IDs saved (or active) by the current authenticated user.
 * Returns an empty Set if the user is unauthenticated or client is unconfigured.
 */
export async function getUserSavedProjectIds(): Promise<Set<string>> {
  const supabase = await createOptionalClient();
  if (!supabase) return new Set();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return new Set();

    const { data, error } = await supabase
      .from('user_projects')
      .select('project_id')
      .eq('user_id', user.id);

    if (error || !data) {
      console.error('[getUserSavedProjectIds] Error querying user_projects:', error?.message);
      return new Set();
    }

    return new Set(data.map((row) => row.project_id));
  } catch (err) {
    console.error('[getUserSavedProjectIds] Unexpected error:', err);
    return new Set();
  }
}

/**
 * Checks whether a specific project is saved by the current authenticated user.
 */
export async function isProjectSavedByUser(projectId: string): Promise<boolean> {
  const supabase = await createOptionalClient();
  if (!supabase || !projectId) return false;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data, error } = await supabase
      .from('user_projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .maybeSingle();

    if (error || !data) return false;
    return true;
  } catch (err) {
    console.error('[isProjectSavedByUser] Unexpected error:', err);
    return false;
  }
}

/**
 * Retrieves all saved projects for the current authenticated user,
 * joined with full catalogue details from public.projects.
 *
 * Only returns projects that are published in the catalogue.
 */
export async function getUserSavedProjects(): Promise<{
  savedProjects: SavedProjectItem[];
  error: string | null;
}> {
  const supabase = await createOptionalClient();
  if (!supabase) {
    return {
      savedProjects: [],
      error: 'Database connection is not configured.',
    };
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return {
        savedProjects: [],
        error: 'Authentication required to view saved projects.',
      };
    }

    // Query user_projects for the current user
    const { data: userProjectsData, error: userProjectsError } = await supabase
      .from('user_projects')
      .select('id, project_id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (userProjectsError) {
      console.error('[getUserSavedProjects] Query error:', userProjectsError.message);
      return {
        savedProjects: [],
        error: 'Unable to retrieve your saved projects. Please try again.',
      };
    }

    if (!userProjectsData || userProjectsData.length === 0) {
      return { savedProjects: [], error: null };
    }

    // Fetch the published catalogue projects corresponding to these project IDs
    const projectIds = userProjectsData.map((up) => up.project_id);
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .in('id', projectIds)
      .eq('published', true);

    if (projectsError) {
      console.error('[getUserSavedProjects] Projects query error:', projectsError.message);
      return {
        savedProjects: [],
        error: 'Unable to load project details for saved projects.',
      };
    }

    const projectsMap = new Map<string, Project>();
    (projectsData || []).forEach((row) => {
      projectsMap.set(row.id, mapRowToProject(row));
    });

    const savedProjects: SavedProjectItem[] = [];
    for (const up of userProjectsData) {
      const project = projectsMap.get(up.project_id);
      if (project) {
        savedProjects.push({
          userProjectId: up.id,
          status: up.status,
          savedAt: up.created_at,
          project,
        });
      }
    }

    return { savedProjects, error: null };
  } catch (err) {
    console.error('[getUserSavedProjects] Unexpected error:', err);
    return {
      savedProjects: [],
      error: 'A network error occurred while retrieving your saved projects.',
    };
  }
}

