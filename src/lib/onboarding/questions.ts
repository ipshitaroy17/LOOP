import type { QuestionDefinition, QuestionId } from './types';

export const ONBOARDING_QUESTIONS: QuestionDefinition[] = [
  {
    id: 'experience_level',
    step: 1,
    prompt: 'How experienced are you with crochet?',
    type: 'single',
    required: true,
    options: [
      { id: 'beginner', label: 'Complete beginner', dbValue: 'beginner' },
      { id: 'intermediate', label: 'Intermediate', dbValue: 'intermediate' },
      { id: 'advanced', label: 'Experienced', dbValue: 'advanced' },
    ],
  },
  {
    id: 'completed_projects',
    step: 2,
    prompt: 'How many crochet projects have you completed?',
    type: 'single',
    required: false,
    options: [
      { id: 'none', label: 'None yet' },
      { id: '1-5', label: '1–5' },
      { id: '6-15', label: '6–15' },
      { id: '16-30', label: '16–30' },
      { id: 'more-than-30', label: 'More than 30' },
    ],
  },
  {
    id: 'crochet_duration',
    step: 3,
    prompt: 'How long have you been crocheting?',
    type: 'single',
    required: false,
    options: [
      { id: 'not-started', label: 'Haven’t started' },
      { id: 'less-than-1-month', label: 'Less than one month' },
      { id: '1-6-months', label: '1–6 months' },
      { id: '6-12-months', label: '6–12 months' },
      { id: 'more-than-1-year', label: 'More than one year' },
    ],
  },
  {
    id: 'interests',
    step: 4,
    prompt: 'What do you enjoy making or want to learn?',
    type: 'multiple',
    required: false,
    options: [
      { id: 'flowers', label: 'Flowers' },
      { id: 'keychains', label: 'Keychains' },
      { id: 'bags', label: 'Bags' },
      { id: 'clothes', label: 'Clothes' },
      { id: 'amigurumi', label: 'Amigurumi and plushies' },
      { id: 'home-decor', label: 'Home decor' },
      { id: 'accessories', label: 'Accessories' },
      { id: 'gifts', label: 'Gifts' },
      { id: 'other', label: 'Other crochet projects' },
    ],
  },
  {
    id: 'primary_goal',
    step: 5,
    prompt: 'What is your main crochet goal?',
    type: 'single',
    required: false,
    options: [
      { id: 'learn-stitches', label: 'Learn basic stitches' },
      { id: 'finish-first-project', label: 'Finish my first project' },
      { id: 'make-gifts', label: 'Make handmade gifts' },
      { id: 'improve-techniques', label: 'Improve my crochet techniques' },
      { id: 'create-patterns', label: 'Create my own patterns' },
      { id: 'sell-products', label: 'Make products to sell' },
    ],
  },
  {
    id: 'learning_style',
    step: 6,
    prompt: 'How do you prefer learning?',
    type: 'single',
    required: false,
    options: [
      { id: 'video', label: 'Watching videos' },
      { id: 'written', label: 'Reading written instructions' },
      { id: 'steps', label: 'Following one step at a time' },
      { id: 'combination', label: 'A combination of all three' },
    ],
  },
  {
    id: 'biggest_hurdle',
    step: 7,
    prompt: 'What do you find most difficult?',
    type: 'single',
    required: false,
    options: [
      { id: 'written-patterns', label: 'Understanding written patterns' },
      { id: 'learning-stitches', label: 'Learning stitches' },
      { id: 'counting', label: 'Counting stitches and rounds' },
      { id: 'fixing-mistakes', label: 'Fixing mistakes' },
      { id: 'choosing-materials', label: 'Choosing yarn and hooks' },
      { id: 'not-started', label: 'I haven’t started yet' },
    ],
  },
  {
    id: 'session_time',
    step: 8,
    prompt: 'How much time can you spend on crochet per session?',
    type: 'single',
    required: false,
    options: [
      { id: '10-20', label: '10–20 minutes' },
      { id: '20-45', label: '20–45 minutes' },
      { id: '45-90', label: '45–90 minutes' },
      { id: 'more-than-90', label: 'More than 90 minutes' },
    ],
  },
];

export const TOTAL_QUESTIONS = ONBOARDING_QUESTIONS.length;

export function getQuestionByStep(step: number): QuestionDefinition | undefined {
  return ONBOARDING_QUESTIONS.find((q) => q.step === step);
}

export function getQuestionById(id: QuestionId): QuestionDefinition | undefined {
  return ONBOARDING_QUESTIONS.find((q) => q.id === id);
}

