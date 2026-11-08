import type {
  TutorialReviewStatus,
  PatternSourceType,
} from '@/lib/supabase/types';

export interface MaterialItem {
  category: string;
  item: string;
  quantity?: string;
  notes?: string;
}

export interface PatternStep {
  id: string;
  tutorialId: string;
  stepNumber: number;
  stepIdentifier: string;
  title: string;
  instruction: string;
  stitchCount: string | null;
  abbreviations: string[];
  notes: string | null;
  videoTimestampSeconds: number | null;
  timestampVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tutorial {
  id: string;
  projectId: string;
  tutorialKey: string;
  title: string;
  learningObjective: string;
  terminology: string;
  abbreviations: Record<string, string>;
  materialsDetails: MaterialItem[];

  // Pattern source & licensing validation
  patternSourceType: PatternSourceType;
  patternSourceTitle: string | null;
  patternSourceAuthor: string | null;
  patternSourceUrl: string | null;
  patternLicense: string | null;
  patternPermissionNotes: string | null;
  patternTested: boolean;
  patternTestedNotes: string | null;

  // Video embed & creator attribution
  videoUrl: string | null;
  videoCreatorName: string | null;
  videoCreatorUrl: string | null;
  videoEmbedAllowed: boolean;

  // Review & publication
  reviewStatus: TutorialReviewStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  // Ordered pattern steps (if loaded)
  steps?: PatternStep[];
}

