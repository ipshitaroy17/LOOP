import { createOptionalClient } from '@/lib/supabase/server';
import type { Project, CatalogueFilters, CatalogueQueryResult } from './types';
import type { Database } from '@/lib/supabase/types';
import { sanitizeSearchQuery } from './sanitize';

export { sanitizeSearchQuery };

type ProjectRow = Database['public']['Tables']['projects']['Row'];

/**
 * Normalizes a raw Supabase database row into a strictly typed Project domain model.
 * Provides resilient fallbacks for newly added columns if migrations are pending.
 */
export function mapRowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    thumbnail_url: row.thumbnail_url,
    estimated_duration: row.estimated_duration,
    estimated_minutes: row.estimated_minutes ?? null,
    materials: Array.isArray(row.materials) ? row.materials : [],
    skills: Array.isArray(row.skills) ? row.skills : [],
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Fetches published catalogue projects matching optional search, category, and difficulty filters.
 *
 * Requirements:
 * - Only queries published = true.
 * - Deterministic ordering (title ascending).
 * - Safe punctuation handling.
 * - Graceful error handling (returns error string, never replaces with fake array).
 */
export async function getPublishedProjects(
  filters: CatalogueFilters = {},
  limit?: number
): Promise<CatalogueQueryResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, filters.pageSize ?? limit ?? 12);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createOptionalClient();

  if (!supabase) {
    return {
      projects: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
      error: 'Supabase client is not configured. Please check your environment variables.',
    };
  }

  try {
    const buildQuery = (includeSkillsSearch: boolean) => {
      let q = supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('published', true);

      if (filters.category && filters.category !== 'all') {
        q = q.eq('category', filters.category);
      }

      if (filters.difficulty && filters.difficulty !== 'all') {
        q = q.eq(
          'difficulty',
          filters.difficulty as Database['public']['Tables']['projects']['Row']['difficulty']
        );
      }

      const cleanSearch = sanitizeSearchQuery(filters.search);
      if (cleanSearch) {
        if (includeSkillsSearch) {
          q = q.or(
            `title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%,skills_text.ilike.%${cleanSearch}%`
          );
        } else {
          q = q.or(`title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
        }
      }

      // Deterministic pagination ordering: primary title ASC, secondary id ASC
      return q
        .order('title', { ascending: true })
        .order('id', { ascending: true })
        .range(from, to);
    };

    let { data, count, error } = await buildQuery(true);

    // Resilient fallback if skills_text column is not yet present on remote DB
    if (error && error.message?.includes('skills_text')) {
      const fallbackResult = await buildQuery(false);
      data = fallbackResult.data;
      count = fallbackResult.count;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('[getPublishedProjects] Supabase error:', error.message);
      return {
        projects: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 1,
        error: 'Unable to retrieve projects from the catalogue. Please try again.',
      };
    }

    const projects: Project[] = (data || []).map(mapRowToProject);
    const totalCount = count ?? projects.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      projects,
      totalCount,
      page,
      pageSize,
      totalPages,
      error: null,
    };
  } catch (err) {
    console.error('[getPublishedProjects] Unexpected error:', err);
    return {
      projects: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 1,
      error: 'A network error occurred while connecting to the catalogue.',
    };
  }
}

/**
 * Fetches a single published project by its unique URL slug.
 * Returns null if the project does not exist or is unpublished (draft).
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createOptionalClient();
  if (!supabase || !slug) return null;

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return mapRowToProject(data);
  } catch (err) {
    console.error('[getProjectBySlug] Error fetching slug:', slug, err);
    return null;
  }
}
