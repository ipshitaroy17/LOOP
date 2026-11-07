/**
 * LOOP Crochet Catalogue Category and Difficulty Definitions & Mappings.
 *
 * Provides explicit bi-directional compatibility between catalogue project categories
 * and learner interests recorded during onboarding (Q4).
 */

export interface CategoryOption {
  id: string;
  label: string;
  onboardingInterestId: string;
}

export const CATALOGUE_CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All Categories', onboardingInterestId: '' },
  { id: 'home-decor', label: 'Home Decor', onboardingInterestId: 'home-decor' },
  { id: 'flowers', label: 'Flowers', onboardingInterestId: 'flowers' },
  { id: 'keychains', label: 'Keychains', onboardingInterestId: 'keychains' },
  { id: 'accessories', label: 'Accessories', onboardingInterestId: 'accessories' },
  { id: 'bags', label: 'Bags', onboardingInterestId: 'bags' },
  { id: 'amigurumi', label: 'Amigurumi', onboardingInterestId: 'amigurumi' },
  { id: 'clothes', label: 'Clothes', onboardingInterestId: 'clothes' },
];

export interface DifficultyOption {
  id: string;
  label: string;
}

export const CATALOGUE_DIFFICULTIES: DifficultyOption[] = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'easy', label: 'Easy' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

/**
 * Returns a human-friendly label for a category ID.
 */
export function getCategoryLabel(categoryId: string): string {
  const match = CATALOGUE_CATEGORIES.find((c) => c.id === categoryId);
  if (match && match.id !== 'all') return match.label;
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1).replace('-', ' ');
}

/**
 * Returns a human-friendly label for a difficulty ID.
 */
export function getDifficultyLabel(difficultyId: string): string {
  const match = CATALOGUE_DIFFICULTIES.find((d) => d.id === difficultyId);
  if (match && match.id !== 'all') return match.label;
  return difficultyId.charAt(0).toUpperCase() + difficultyId.slice(1);
}

/**
 * Validates a category query parameter; returns undefined if not a known category.
 */
export function sanitizeCategoryFilter(value?: string | null): string | undefined {
  if (!value || value === 'all') return undefined;
  const exists = CATALOGUE_CATEGORIES.some((c) => c.id === value && c.id !== 'all');
  return exists ? value : undefined;
}

/**
 * Validates a difficulty query parameter; returns undefined if not a known difficulty.
 */
export function sanitizeDifficultyFilter(value?: string | null): string | undefined {
  if (!value || value === 'all') return undefined;
  const exists = CATALOGUE_DIFFICULTIES.some((d) => d.id === value && d.id !== 'all');
  return exists ? value : undefined;
}
