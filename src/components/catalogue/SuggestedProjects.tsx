import Link from 'next/link';
import ProjectCard from './ProjectCard';
import type { Project } from '@/lib/catalogue/types';
import type { OnboardingPreferences } from '@/lib/onboarding/types';
import { rankProjectsForUser } from '@/lib/catalogue/recommendations';
import Chip from '@/components/ui/Chip';

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
  const { isPersonalized, projects } = rankProjectsForUser(
    allProjects,
    preferences,
    experienceLevel,
    3
  );

  return (
    <section aria-labelledby="suggested-heading" className="mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2
            id="suggested-heading"
            className="font-display font-bold text-2xl sm:text-3xl text-ink"
          >
            Suggested for you
          </h2>
          <Chip variant="sage-light" size="sm">
            {isPersonalized ? 'Personalised' : 'Recommended'}
          </Chip>
        </div>

        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/75 hover:text-ink transition-colors self-start sm:self-auto"
        >
          <span>Explore all projects</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project, idx) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={idx}
              initialIsSaved={savedProjectIds.includes(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[28px] p-8 sm:p-12 text-center border border-ink/5 shadow-[0_4px_24px_rgba(46,42,54,0.06)]">
          <p className="font-body text-sm text-ink/75 mb-4">
            No projects are currently published in the catalogue.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center px-6 py-2.5 rounded-full text-xs font-semibold bg-sage text-ink hover:bg-sage-dark hover:text-white transition-all shadow-xs"
          >
            Visit Explore page
          </Link>
        </div>
      )}
    </section>
  );
}
