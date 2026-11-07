'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ONBOARDING_QUESTIONS,
  TOTAL_QUESTIONS,
} from '@/lib/onboarding/questions';
import type {
  OnboardingAnswers,
  OnboardingPreferences,
  QuestionDefinition,
  SingleAnswer,
  MultipleAnswer,
} from '@/lib/onboarding/types';
import {
  saveOnboardingStepAction,
  completeOnboardingAction,
} from './actions';

interface OnboardingFlowProps {
  initialPreferences: OnboardingPreferences | null;
  isEditMode: boolean;
  userDisplayName?: string | null;
}

export default function OnboardingFlow({
  initialPreferences,
  isEditMode,
  userDisplayName,
}: OnboardingFlowProps) {
  const router = useRouter();

  // If initial preferences exist and not in edit mode, resume from saved step (1-8)
  const startingStep = !isEditMode && initialPreferences?.current_step
    ? Math.max(1, Math.min(initialPreferences.current_step, TOTAL_QUESTIONS))
    : 1;

  const [currentStep, setCurrentStep] = useState<number>(startingStep);
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    initialPreferences?.answers || {}
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentQuestion: QuestionDefinition = ONBOARDING_QUESTIONS[currentStep - 1];

  // Current answer state for the active step
  const currentSavedAnswer = answers[currentQuestion.id];

  const getSelectedSingle = (): string => {
    if (!currentSavedAnswer || 'skipped' in currentSavedAnswer) return '';
    return (currentSavedAnswer as SingleAnswer).value || '';
  };

  const getSelectedMultiple = (): string[] => {
    if (!currentSavedAnswer || 'skipped' in currentSavedAnswer) return [];
    return (currentSavedAnswer as MultipleAnswer).values || [];
  };

  const isCurrentSkipped = Boolean(
    currentSavedAnswer && 'skipped' in currentSavedAnswer
  );

  // Handle single selection
  const handleSingleSelect = (optionId: string, optionLabel: string) => {
    setErrorMessage(null);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { value: optionId, label: optionLabel },
    }));
  };

  // Handle multiple selection (toggle)
  const handleMultipleToggle = (optionId: string, optionLabel: string) => {
    setErrorMessage(null);
    setAnswers((prev) => {
      const existing = (prev[currentQuestion.id] as MultipleAnswer)?.values || [];
      const existingLabels = (prev[currentQuestion.id] as MultipleAnswer)?.labels || [];

      let nextValues: string[];
      let nextLabels: string[];

      if (existing.includes(optionId)) {
        nextValues = existing.filter((id) => id !== optionId);
        nextLabels = existingLabels.filter((lbl) => lbl !== optionLabel);
      } else {
        nextValues = [...existing, optionId];
        nextLabels = [...existingLabels, optionLabel];
      }

      if (nextValues.length === 0) {
        const copy = { ...prev };
        delete copy[currentQuestion.id];
        return copy;
      }

      return {
        ...prev,
        [currentQuestion.id]: { values: nextValues, labels: nextLabels },
      };
    });
  };

  // Check if current question has an answer
  const hasAnswer = Boolean(
    currentQuestion.type === 'single'
      ? getSelectedSingle()
      : getSelectedMultiple().length > 0
  );

  // Advance to next question or complete
  const handleContinue = async () => {
    if (isSaving) return;
    setErrorMessage(null);

    // Validate Q1 requirement
    if (currentQuestion.required && !hasAnswer) {
      setErrorMessage('Please choose an option to continue.');
      return;
    }

    setIsSaving(true);

    try {
      const isFinalStep = currentStep === TOTAL_QUESTIONS;

      if (isFinalStep) {
        // Complete the entire onboarding flow
        const result = await completeOnboardingAction({
          answers,
          isEditMode,
        });

        if (!result.success) {
          setErrorMessage(result.error || 'Failed to complete onboarding. Please try again.');
          setIsSaving(false);
          return;
        }

        router.push('/dashboard');
        router.refresh();
        return;
      }

      // Intermediate step save
      const answerPayload =
        currentQuestion.type === 'single'
          ? getSelectedSingle()
          : getSelectedMultiple();

      const result = await saveOnboardingStepAction({
        step: currentStep,
        answer: answerPayload,
        skipped: false,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to save progress. Please try again.');
        setIsSaving(false);
        return;
      }

      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_QUESTIONS));
    } catch {
      setErrorMessage('Connection error. Your selections have been kept; please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Skip the current question
  const handleSkip = async () => {
    if (isSaving || currentQuestion.required) return;
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const nextAnswers: OnboardingAnswers = {
        ...answers,
        [currentQuestion.id]: { skipped: true },
      };
      setAnswers(nextAnswers);

      const isFinalStep = currentStep === TOTAL_QUESTIONS;

      if (isFinalStep) {
        const result = await completeOnboardingAction({
          answers: nextAnswers,
          isEditMode,
        });

        if (!result.success) {
          setErrorMessage(result.error || 'Failed to finish onboarding. Please try again.');
          setIsSaving(false);
          return;
        }

        router.push('/dashboard');
        router.refresh();
        return;
      }

      const result = await saveOnboardingStepAction({
        step: currentStep,
        skipped: true,
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Failed to record skip. Please retry.');
        setIsSaving(false);
        return;
      }

      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_QUESTIONS));
    } catch {
      setErrorMessage('Connection error while skipping. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (isSaving || currentStep <= 1) return;
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const progressPercent = Math.round((currentStep / TOTAL_QUESTIONS) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ── Top Bar / Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-wider block mb-1"
            style={{ color: 'var(--color-sage)' }}
          >
            {isEditMode
              ? 'Edit Learning Preferences'
              : userDisplayName
              ? `Welcome, ${userDisplayName}`
              : 'Personalize Your Experience'}
          </span>
          <p className="text-sm font-medium" style={{ color: 'var(--color-charcoal-soft)' }}>
            Question {currentStep} of {TOTAL_QUESTIONS}
          </p>
        </div>

        {isEditMode && (
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-black/10 transition-colors hover:bg-black/5"
            style={{ color: 'var(--color-charcoal)' }}
          >
            Return to dashboard
          </Link>
        )}
      </div>

      {/* ── Accessible Progress Bar ──────────────────────────────────────── */}
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={TOTAL_QUESTIONS}
        aria-label={`Onboarding progress: Question ${currentStep} of ${TOTAL_QUESTIONS}`}
        className="w-full h-2 rounded-full overflow-hidden mb-8"
        style={{ backgroundColor: 'rgba(124, 154, 107, 0.2)' }}
      >
        <div
          className="h-full transition-all duration-300 ease-out rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: 'var(--color-sage)',
          }}
        />
      </div>

      {/* ── Question Card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-black/5">
        <h1
          id="question-heading"
          className="text-2xl sm:text-3xl font-bold tracking-tight mb-2"
          style={{ color: 'var(--color-charcoal)' }}
        >
          {currentQuestion.prompt}
        </h1>

        <p className="text-sm mb-6" style={{ color: 'var(--color-charcoal-soft)' }}>
          {currentQuestion.required ? (
            <span className="font-semibold text-red-700">* Required</span>
          ) : currentQuestion.type === 'multiple' ? (
            <span>Select all that apply, or skip for now</span>
          ) : (
            <span>Select one answer, or skip for now</span>
          )}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl text-sm leading-relaxed"
            style={{ backgroundColor: '#FDF2F2', color: '#991B1B', border: '1px solid #F87171' }}
          >
            {errorMessage}
          </div>
        )}

        {/* ── Options Group ───────────────────────────────────────────────── */}
        <div
          role={currentQuestion.type === 'single' ? 'radiogroup' : 'group'}
          aria-labelledby="question-heading"
          className="grid grid-cols-1 gap-3 sm:gap-3.5 mb-8"
        >
          {currentQuestion.options.map((option) => {
            const isSingleSelected =
              currentQuestion.type === 'single' && getSelectedSingle() === option.id;
            const isMultiSelected =
              currentQuestion.type === 'multiple' &&
              getSelectedMultiple().includes(option.id);
            const isSelected = isSingleSelected || isMultiSelected;

            return (
              <label
                key={option.id}
                className="relative flex items-center p-4 sm:p-5 rounded-2xl cursor-pointer border-2 transition-all select-none"
                style={{
                  borderColor: isSelected ? 'var(--color-sage)' : '#E5E7EB',
                  backgroundColor: isSelected ? '#F4F7F2' : '#FAF7F0',
                }}
              >
                {/* Native input for keyboard access and semantics */}
                {currentQuestion.type === 'single' ? (
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.id}
                    checked={isSingleSelected}
                    onChange={() => handleSingleSelect(option.id, option.label)}
                    className="sr-only"
                    aria-checked={isSingleSelected}
                  />
                ) : (
                  <input
                    type="checkbox"
                    name={currentQuestion.id}
                    value={option.id}
                    checked={isMultiSelected}
                    onChange={() => handleMultipleToggle(option.id, option.label)}
                    className="sr-only"
                    aria-checked={isMultiSelected}
                  />
                )}

                {/* Custom radio/checkbox pill indicator */}
                <div
                  className={`w-5 h-5 flex items-center justify-center mr-4 transition-colors ${
                    currentQuestion.type === 'single' ? 'rounded-full' : 'rounded-md'
                  }`}
                  style={{
                    border: isSelected ? 'none' : '2px solid #9CA3AF',
                    backgroundColor: isSelected ? 'var(--color-sage)' : 'transparent',
                  }}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span
                      className="text-xs font-black leading-none"
                      style={{ color: '#1F1F1F' }}
                    >
                      ✓
                    </span>
                  )}
                </div>

                {/* Option text */}
                <span
                  className="text-base sm:text-lg font-medium"
                  style={{
                    color: isSelected ? '#1F1F1F' : 'var(--color-charcoal)',
                  }}
                >
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>

        {/* ── Action Buttons Footer ────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-black/5">
          {/* Back button */}
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-semibold border border-black/10 transition-colors hover:bg-black/5 disabled:opacity-50"
                style={{ color: 'var(--color-charcoal)' }}
              >
                Back
              </button>
            ) : (
              <div />
            )}
          </div>

          {/* Forward actions: Continue and Skip */}
          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
            {!currentQuestion.required && (
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-medium transition-colors hover:underline text-center"
                style={{ color: 'var(--color-charcoal-soft)' }}
              >
                {isCurrentSkipped ? 'Skipped (skip again)' : 'Skip for now'}
              </button>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={isSaving || (currentQuestion.required && !hasAnswer)}
              className="w-full sm:w-auto px-8 py-3 rounded-full text-base font-semibold transition-all hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-sage)',
                color: '#1F1F1F',
              }}
            >
              {isSaving
                ? 'Saving...'
                : currentStep === TOTAL_QUESTIONS
                ? isEditMode
                  ? 'Save changes'
                  : 'Start learning'
                : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
