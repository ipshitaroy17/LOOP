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
  limit: number = 50
): Promise<CatalogueQueryResult> {
  const supabase = await createOptionalClient();

  if (!supabase) {
    return {
      projects: [],
      totalCount: 0,
      error: 'Supabase client is not configured. Please check your environment variables.',
    };
  }

  try {
    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('published', true);

    // Apply category filter if specified
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    // Apply difficulty filter if specified
    if (filters.difficulty && filters.difficulty !== 'all') {
      query = query.eq('difficulty', filters.difficulty as Database['public']['Tables']['projects']['Row']['difficulty']);
    }

    // Apply search filter if specified
    const cleanSearch = sanitizeSearchQuery(filters.search);
    if (cleanSearch) {
      // Search both title and description safely
      query = query.or(`title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
    }

    // Deterministic ordering
    query = query.order('title', { ascending: true }).limit(limit);

    const { data, count, error } = await query;

    if (error) {
      console.error('[getPublishedProjects] Supabase error:', error.message);
      return {
        projects: [],
        totalCount: 0,
        error: 'Unable to retrieve projects from the catalogue. Please try again.',
      };
    }

    const projects: Project[] = (data || []).map(mapRowToProject);

    return {
      projects,
      totalCount: count ?? projects.length,
      error: null,
    };
  } catch (err) {
    console.error('[getPublishedProjects] Unexpected error:', err);
    return {
      projects: [],
      totalCount: 0,
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
