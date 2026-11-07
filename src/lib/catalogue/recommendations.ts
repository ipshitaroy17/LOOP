import type { Project, RecommendationResult } from './types';
import type { OnboardingPreferences, MultipleAnswer, SingleAnswer } from '../onboarding/types';

/**
 * Deterministic Rules-Based Recommendation Engine for LOOP Catalogue.
 *
 * Requirements:
 * 1. Match saved interests to project categories.
 * 2. Prefer projects appropriate to the selected experience level.
 * 3. Use stable ordering (title/slug) to break ties deterministically.
 * 4. Explicitly does NOT equate session time to total project duration.
 * 5. If preferences are missing or no matches exist, falls back gracefully
 *    to neutral "Browse projects" without falsely claiming personalization.
 */
export function rankProjectsForUser(
  projects: Project[],
  preferences: OnboardingPreferences | null,
  experienceLevel?: string | null,
  limit: number = 3
): RecommendationResult {
  if (!projects || projects.length === 0) {
    return {
      isPersonalized: false,
      projects: [],
      reason: 'No projects currently published in the catalogue.',
    };
  }

  // 1. Extract saved interests
  const answers = preferences?.answers || {};
  let userInterests: string[] = [];
  if (answers.interests && !('skipped' in answers.interests)) {
    const multi = answers.interests as MultipleAnswer;
    userInterests = multi.values || [];
  }

  // 2. Extract experience level (profile level has priority, then Q1 answer)
  let effectiveLevel = experienceLevel;
  if (!effectiveLevel && answers.experience_level && !('skipped' in answers.experience_level)) {
    const single = answers.experience_level as SingleAnswer;
    effectiveLevel = single.value;
  }

  const hasPreferences = userInterests.length > 0 || Boolean(effectiveLevel);

  // If user skipped or has no preferences, return neutral fallback
  if (!hasPreferences) {
    // Sort deterministically by slug
    const fallback = [...projects].sort((a, b) => a.slug.localeCompare(b.slug)).slice(0, limit);
    return {
      isPersonalized: false,
      projects: fallback,
      reason: 'Browse starter projects from the LOOP catalogue.',
    };
  }

  // 3. Score each project based on rules
  const scored = projects.map((project) => {
    let score = 0;
    let matchedCategory = false;

    // Rule A: Category matching (+10 for exact match)
    if (userInterests.includes(project.category)) {
      score += 10;
      matchedCategory = true;
    }

    // Special interest bonus: 'gifts' interest boosts giftable small items
    if (userInterests.includes('gifts')) {
      if (['keychains', 'flowers', 'accessories'].includes(project.category)) {
        score += 3;
      }
    }

    // Rule B: Experience level alignment
    if (effectiveLevel === 'beginner') {
      if (project.difficulty === 'beginner') score += 5;
      else if (project.difficulty === 'easy') score += 3;
      else if (project.difficulty === 'intermediate') score += 0;
      else if (project.difficulty === 'advanced') score -= 2;
    } else if (effectiveLevel === 'intermediate') {
      if (project.difficulty === 'intermediate') score += 5;
      else if (project.difficulty === 'easy') score += 4;
      else if (project.difficulty === 'beginner') score += 2;
      else if (project.difficulty === 'advanced') score += 2;
    } else if (effectiveLevel === 'advanced') {
      if (project.difficulty === 'advanced') score += 5;
      else if (project.difficulty === 'intermediate') score += 4;
      else if (project.difficulty === 'easy') score += 2;
      else if (project.difficulty === 'beginner') score += 1;
    }

    return {
      project,
      score,
      matchedCategory,
    };
  });

  // 4. Stable sort: score desc, then slug asc
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.project.slug.localeCompare(b.project.slug);
  });

  const topProjects = scored.slice(0, limit).map((s) => s.project);
  const highestScore = scored[0]?.score ?? 0;

  // If no project scored above 0 (no interest or difficulty match at all), don't claim personalization
  if (highestScore <= 0) {
    return {
      isPersonalized: false,
      projects: topProjects,
      reason: 'Browse starter projects from the LOOP catalogue.',
    };
  }

  return {
    isPersonalized: true,
    projects: topProjects,
    reason: 'Suggested based on your learning interests and crochet skill level.',
  };
}
