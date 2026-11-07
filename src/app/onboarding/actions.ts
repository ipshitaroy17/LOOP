'use server';

import { createClient } from '@/lib/supabase/server';
import {
  ONBOARDING_QUESTIONS,
  getQuestionByStep,
} from '@/lib/onboarding/questions';
import type {
  OnboardingAnswers,
  OnboardingPreferences,
  StoredAnswer,
} from '@/lib/onboarding/types';
import type { ExperienceLevel, Json } from '@/lib/supabase/types';

export interface SaveStepResult {
  success: boolean;
  error?: string;
  nextStep?: number;
}

export interface CompleteOnboardingResult {
  success: boolean;
  error?: string;
}

/**
 * Validates and maps an answer to a stored format with labels.
 */
function validateAndFormatAnswer(
  step: number,
  answer: string | string[] | undefined,
  skipped: boolean
): { stored: StoredAnswer; experienceLevel?: ExperienceLevel } {
  const question = getQuestionByStep(step);
  if (!question) {
    throw new Error('Invalid question step.');
  }

  if (skipped) {
    if (question.required) {
      throw new Error('This question is required and cannot be skipped.');
    }
    return { stored: { skipped: true } };
  }

  if (question.type === 'single') {
    if (typeof answer !== 'string' || !answer) {
      if (question.required) {
        throw new Error('Please select an option to continue.');
      }
      return { stored: { skipped: true } };
    }

    const matchedOption = question.options.find((opt) => opt.id === answer);
    if (!matchedOption) {
      throw new Error('Selected option is not recognized.');
    }

    return {
      stored: { value: matchedOption.id, label: matchedOption.label },
      experienceLevel: matchedOption.dbValue,
    };
  }

  // Multiple choice
  if (!Array.isArray(answer) || answer.length === 0) {
    if (question.required) {
      throw new Error('Please select at least one option.');
    }
    return { stored: { skipped: true } };
  }

  // Cap max selections to prevent oversized payload abuse
  if (answer.length > question.options.length) {
    throw new Error('Too many options selected.');
  }

  const matchedOptions = question.options.filter((opt) => answer.includes(opt.id));
  if (matchedOptions.length === 0) {
    return { stored: { skipped: true } };
  }

  return {
    stored: {
      values: matchedOptions.map((o) => o.id),
      labels: matchedOptions.map((o) => o.label),
    },
  };
}

/**
 * Server Action: Persists a single step's answer to Supabase.
 * Allows progress to be saved as the user moves between questions.
 */
export async function saveOnboardingStepAction(params: {
  step: number;
  answer?: string | string[];
  skipped?: boolean;
}): Promise<SaveStepResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return { success: false, error: 'You must be signed in to save preferences.' };
    }

    const { step, answer, skipped = false } = params;
    if (step < 1 || step > ONBOARDING_QUESTIONS.length) {
      return { success: false, error: 'Invalid question number.' };
    }

    const question = getQuestionByStep(step)!;
    const { stored, experienceLevel } = validateAndFormatAnswer(step, answer, skipped);

    // Fetch existing preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_preferences')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return { success: false, error: 'Failed to access user profile.' };
    }

    const existingPrefs = (profile?.onboarding_preferences as unknown as OnboardingPreferences) || {
      version: 1,
      current_step: 1,
      answers: {},
      updated_at: new Date().toISOString(),
    };

    const nextAnswers: OnboardingAnswers = {
      ...(existingPrefs.answers || {}),
      [question.id]: stored,
    };

    const nextStep = Math.min(step + 1, ONBOARDING_QUESTIONS.length);

    const updatedPreferences: OnboardingPreferences = {
      version: 1,
      current_step: nextStep,
      answers: nextAnswers,
      updated_at: new Date().toISOString(),
    };

    const updatePayload: {
      onboarding_preferences: Json;
      experience_level?: ExperienceLevel;
    } = {
      onboarding_preferences: updatedPreferences as unknown as Json,
    };

    if (experienceLevel) {
      updatePayload.experience_level = experienceLevel;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id);

    if (updateError) {
      return { success: false, error: 'Failed to save answer to your profile. Please retry.' };
    }

    return { success: true, nextStep };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}

/**
 * Server Action: Finalizes the onboarding flow and marks onboarding_completed = true.
 */
export async function completeOnboardingAction(params: {
  answers: OnboardingAnswers;
  isEditMode?: boolean;
}): Promise<CompleteOnboardingResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!user || userError) {
      return { success: false, error: 'You must be signed in to complete onboarding.' };
    }

    const { answers } = params;

    // Validate Q1 (required)
    if (!answers.experience_level || 'skipped' in answers.experience_level) {
      return { success: false, error: 'Question 1 (crochet experience level) is required.' };
    }

    const expOption = ONBOARDING_QUESTIONS[0].options.find(
      (opt) => opt.id === answers.experience_level?.value
    );
    if (!expOption || !expOption.dbValue) {
      return { success: false, error: 'Invalid experience level selection.' };
    }

    // Format final preferences
    const finalPreferences: OnboardingPreferences = {
      version: 1,
      current_step: 8,
      answers,
      updated_at: new Date().toISOString(),
    };

    // Save final preferences and complete onboarding in one database update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        experience_level: expOption.dbValue,
        onboarding_preferences: finalPreferences as unknown as Json,
        onboarding_completed: true,
      })
      .eq('id', user.id);

    if (updateError) {
      return { success: false, error: 'Failed to complete onboarding. Please try again.' };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { success: false, error: message };
  }
}
