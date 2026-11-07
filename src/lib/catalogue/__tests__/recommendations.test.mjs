import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { rankProjectsForUser } from '../recommendations.ts';
import { sanitizeSearchQuery } from '../sanitize.ts';

// Sample test projects matching starter catalogue
const mockProjects = [
  {
    id: '1',
    slug: 'beginner-practice-square',
    title: 'Beginner Practice Square',
    category: 'home-decor',
    difficulty: 'beginner',
    estimated_minutes: 25,
    materials: [],
    skills: [],
    published: true,
  },
  {
    id: '2',
    slug: 'simple-square-coaster',
    title: 'Simple Square Coaster',
    category: 'home-decor',
    difficulty: 'beginner',
    estimated_minutes: 35,
    materials: [],
    skills: [],
    published: true,
  },
  {
    id: '3',
    slug: 'classic-granny-square',
    title: 'Classic Granny Square',
    category: 'accessories',
    difficulty: 'easy',
    estimated_minutes: 45,
    materials: [],
    skills: [],
    published: true,
  },
  {
    id: '4',
    slug: 'sweet-blossom-flower',
    title: 'Sweet Blossom Crochet Flower',
    category: 'flowers',
    difficulty: 'beginner',
    estimated_minutes: 20,
    materials: [],
    skills: [],
    published: true,
  },
  {
    id: '5',
    slug: 'heart-keychain',
    title: 'Heart Keychain',
    category: 'keychains',
    difficulty: 'easy',
    estimated_minutes: 40,
    materials: [],
    skills: [],
    published: true,
  },
  {
    id: '6',
    slug: 'mini-drawstring-pouch',
    title: 'Mini Drawstring Pouch',
    category: 'bags',
    difficulty: 'intermediate',
    estimated_minutes: 60,
    materials: [],
    skills: [],
    published: true,
  },
];

describe('Recommendation Engine — rankProjectsForUser', () => {
  test('returns empty when no projects exist', () => {
    const res = rankProjectsForUser([], null, null);
    assert.equal(res.isPersonalized, false);
    assert.equal(res.projects.length, 0);
  });

  test('returns unpersonalized fallback when preferences are null or empty', () => {
    const res = rankProjectsForUser(mockProjects, null, null, 3);
    assert.equal(res.isPersonalized, false);
    assert.equal(res.projects.length, 3);
    // Should be sorted deterministically by slug
    assert.equal(res.projects[0].slug, 'beginner-practice-square');
  });

  test('returns unpersonalized fallback when answers are explicitly skipped', () => {
    const preferences = {
      version: 1,
      completed_at: '2026-11-07T00:00:00Z',
      answers: {
        interests: { questionId: 'interests', step: 4, skipped: true },
        experience_level: { questionId: 'experience_level', step: 1, skipped: true },
      },
    };
    const res = rankProjectsForUser(mockProjects, preferences, null, 3);
    assert.equal(res.isPersonalized, false);
    assert.equal(res.projects.length, 3);
  });

  test('ranks flower project #1 for user interested in flowers', () => {
    const preferences = {
      version: 1,
      completed_at: '2026-11-07T00:00:00Z',
      answers: {
        interests: {
          questionId: 'interests',
          step: 4,
          values: ['flowers'],
          labels: ['Flowers'],
        },
      },
    };
    const res = rankProjectsForUser(mockProjects, preferences, 'beginner', 3);
    assert.equal(res.isPersonalized, true);
    assert.equal(res.projects[0].slug, 'sweet-blossom-flower');
  });

  test('ranks pouch project #1 for intermediate user interested in bags', () => {
    const preferences = {
      version: 1,
      completed_at: '2026-11-07T00:00:00Z',
      answers: {
        interests: {
          questionId: 'interests',
          step: 4,
          values: ['bags'],
          labels: ['Bags'],
        },
      },
    };
    const res = rankProjectsForUser(mockProjects, preferences, 'intermediate', 3);
    assert.equal(res.isPersonalized, true);
    assert.equal(res.projects[0].slug, 'mini-drawstring-pouch');
  });
});

describe('Search Query Sanitization — sanitizeSearchQuery', () => {
  test('escapes SQL wildcard characters', () => {
    assert.equal(sanitizeSearchQuery('50% cotton'), '50\\% cotton');
    assert.equal(sanitizeSearchQuery('pattern_name'), 'pattern\\_name');
  });

  test('trims whitespace and handles null/empty', () => {
    assert.equal(sanitizeSearchQuery('   flower   '), 'flower');
    assert.equal(sanitizeSearchQuery(''), '');
    assert.equal(sanitizeSearchQuery(null), '');
    assert.equal(sanitizeSearchQuery(undefined), '');
  });
});
