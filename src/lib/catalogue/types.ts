/**
 * Domain types for the LOOP Crochet Project Catalogue.
 */

export type ProjectDifficulty = 'beginner' | 'easy' | 'intermediate' | 'advanced';

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: ProjectDifficulty;
  thumbnail_url: string | null;
  estimated_duration: string | null;
  estimated_minutes: number | null;
  materials: string[];
  skills: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CatalogueFilters {
  search?: string;
  category?: string;
  difficulty?: string;
}

export interface CatalogueQueryResult {
  projects: Project[];
  totalCount: number;
  error: string | null;
}

export interface RecommendationResult {
  isPersonalized: boolean;
  projects: Project[];
  reason: string;
}
