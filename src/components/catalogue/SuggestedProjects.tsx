import Link from 'next/link';
import ProjectCard from './ProjectCard';
import type { Project } from '@/lib/catalogue/types';
import type { OnboardingPreferences } from '@/lib/onboarding/types';
import { rankProjectsForUser } from '@/lib/catalogue/recommendations';

interface SuggestedProjectsProps {
  allProjects: Project[];
  preferences: OnboardingPreferences | null;
  experienceLevel?: string | null;
  savedProjectIds?: string[];
}

export default function SuggestedProjects({
  allProjects,
  preferences,
  experienceLevel,
  savedProjectIds = [],
}: SuggestedProjectsProps) {
  const { isPersonalized, projects, reason } = rankProjectsForUser(
    allProjects,
    preferences,
    experienceLevel,
    3
  );

  return (
    <section aria-labelledby="suggested-heading" className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-black/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2
              id="suggested-heading"
              className="text-xl font-bold tracking-tight"
              style={{ color: 'var(--color-charcoal)' }}
            >
              {isPersonalized ? 'Suggested for You' : 'Browse Projects'}
            </h2>
            {isPersonalized && (
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: 'rgba(124, 154, 107, 0.15)',
                  color: 'var(--color-sage)',
                }}
              >
                Personalized
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {reason}
          </p>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm font-semibold hover:underline self-start sm:self-auto"
          style={{ color: 'var(--color-sage)' }}
        >
          <span>Explore all projects</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              initialIsSaved={savedProjectIds.includes(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-black/5 shadow-sm">
          <p className="text-sm mb-4" style={{ color: 'var(--color-charcoal-soft)' }}>
            No projects are currently published in the catalogue.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-5 py-2 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'var(--color-sage)', color: '#1F1F1F' }}
          >
            Visit Explore page
          </Link>
        </div>
      )}
    </section>
  );
}

