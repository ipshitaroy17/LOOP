import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import Link from 'next/link';
import OnboardingFlow from './OnboardingFlow';
import type { OnboardingPreferences } from '@/lib/onboarding/types';

// Allow blocking route for runtime cookies authentication in Next.js 16
export const instant = false;

interface OnboardingPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  await connection();
  const supabase = await createClient();

  // Validate server-side authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    redirect('/login?redirect=/onboarding');
  }

  const resolvedParams = await searchParams;
  const isEditMode = resolvedParams.edit === 'true';

  // Fetch the user's profile under their authenticated RLS policy
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('display_name, experience_level, onboarding_preferences, onboarding_completed')
    .eq('id', user.id)
    .maybeSingle();

  // If profile fetch fails or row is missing
  if (profileError || !profile) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-4 py-12"
        style={{ backgroundColor: 'var(--color-cream)' }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm border border-black/5 text-center">
          <h1 className="text-xl font-bold mb-2 text-red-700">Profile Not Found</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-charcoal-soft)' }}>
            We could not access your profile to load onboarding preferences. Please try refreshing or logging back in.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/login"
              className="py-2.5 px-6 rounded-full font-semibold text-sm transition-colors hover:brightness-105 text-center"
              style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
            >
              Log in again
            </Link>
            <Link
              href="/"
              className="text-xs font-medium underline text-center"
              style={{ color: 'var(--color-charcoal-soft)' }}
            >
              Return home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // If already completed and not in edit mode, go to dashboard
  if (profile.onboarding_completed && !isEditMode) {
    redirect('/dashboard');
  }

  const initialPreferences =
    (profile.onboarding_preferences as unknown as OnboardingPreferences) || null;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 sm:py-16"
      style={{ backgroundColor: 'var(--color-cream)' }}
    >
      <OnboardingFlow
        initialPreferences={initialPreferences}
        isEditMode={isEditMode}
        userDisplayName={profile.display_name}
      />
    </main>
  );
}

