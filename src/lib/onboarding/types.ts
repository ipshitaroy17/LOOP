import type { ExperienceLevel } from '@/lib/supabase/types';

export type QuestionId =
  | 'experience_level'
  | 'completed_projects'
  | 'crochet_duration'
  | 'interests'
  | 'primary_goal'
  | 'learning_style'
  | 'biggest_hurdle'
  | 'session_time';

export type QuestionType = 'single' | 'multiple';

export interface QuestionOption {
  id: string;
  label: string;
  dbValue?: ExperienceLevel;
}

export interface QuestionDefinition {
  id: QuestionId;
  step: number;
  prompt: string;
  type: QuestionType;
  required: boolean;
  options: QuestionOption[];
}

export type SingleAnswer = {
  value: string;
  label: string;
};

export type MultipleAnswer = {
  values: string[];
  labels: string[];
};

export type SkippedAnswer = {
  skipped: true;
};

export type StoredAnswer = SingleAnswer | MultipleAnswer | SkippedAnswer;

export interface OnboardingAnswers {
  experience_level?: SingleAnswer;
  completed_projects?: SingleAnswer | SkippedAnswer;
  crochet_duration?: SingleAnswer | SkippedAnswer;
  interests?: MultipleAnswer | SkippedAnswer;
  primary_goal?: SingleAnswer | SkippedAnswer;
  learning_style?: SingleAnswer | SkippedAnswer;
  biggest_hurdle?: SingleAnswer | SkippedAnswer;
  session_time?: SingleAnswer | SkippedAnswer;
}

export interface OnboardingPreferences {
  version: 1;
  current_step: number;
  answers: OnboardingAnswers;
  updated_at: string;
}

