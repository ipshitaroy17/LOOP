'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Project } from '@/lib/catalogue/types';
import { getCategoryLabel, getDifficultyLabel } from '@/lib/catalogue/categories';
import SaveButton from './SaveButton';
import Chip from '@/components/ui/Chip';

const PASTEL_BGS = [
  'bg-blush-light',
  'bg-sage-light',
  'bg-butter-light',
  'bg-lilac-light',
];

interface ProjectCardProps {
  project: Project;
  index?: number;
  priority?: boolean;
  initialIsSaved?: boolean;
  searchQueryString?: string;
}

export default function ProjectCard({
  project,
  index = 0,
  priority = false,
  initialIsSaved = false,
  searchQueryString,
}: ProjectCardProps) {
  const [imgSrc, setImgSrc] = useState(
    project.thumbnail_url || '/illustrations/projects/project-placeholder.svg'
  );

  const bgClass = PASTEL_BGS[index % PASTEL_BGS.length];

  const difficultyVariant = (() => {
    switch (project.difficulty) {
      case 'beginner':
        return 'sage-light';
      case 'intermediate':
        return 'lilac-light';
      case 'easy':
        return 'butter-light';
      case 'advanced':
        return 'blush-light';
      default:
        return 'sage-light';
    }
  })() as 'sage-light' | 'lilac-light' | 'butter-light' | 'blush-light';

  const projectHref = searchQueryString
    ? `/projects/${project.slug}?${searchQueryString}`
    : `/projects/${project.slug}`;

  return (
    <article className="group bg-white rounded-[28px] overflow-hidden border border-ink/5 shadow-[0_4px_24px_rgba(46,42,54,0.06)] hover:shadow-[0_8px_32px_rgba(46,42,54,0.1)] transition-all flex flex-col h-full">
      <Link
        href={projectHref}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 rounded-[28px] flex-1 flex flex-col"
        aria-label={`Preview project details for ${project.title}`}
      >
        {/* Project Image Area in Rotating Pastel */}
        <div className={`relative w-full aspect-[4/3] ${bgClass} overflow-hidden flex items-center justify-center`}>
          <Image
            src={imgSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover group-hover:scale-102 transition-transform duration-300"
            onError={() => {
              setImgSrc('/illustrations/projects/project-placeholder.svg');
            }}
          />

          {/* Top Left: Save pill */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <SaveButton
              projectId={project.id}
              initialIsSaved={initialIsSaved}
              projectTitle={project.title}
              variant="card"
            />
          </div>

          {/* Top Right: Tutorial coming soon pill */}
          <div className="absolute top-3.5 right-3.5 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-ink shadow-xs border border-ink/5">
              <span className="w-1.5 h-1.5 rounded-full bg-butter border border-ink/20 inline-block" />
              Tutorial coming soon
            </span>
          </div>

          {/* Bottom Left: Category chip */}
          <div className="absolute bottom-3.5 left-3.5 z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/95 text-ink shadow-xs border border-ink/5 backdrop-blur-xs">
              {getCategoryLabel(project.category)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            {/* Difficulty Chip */}
            <div className="flex items-center gap-2 mb-3">
              <Chip variant={difficultyVariant} size="sm">
                {getDifficultyLabel(project.difficulty)}
              </Chip>

              {project.estimated_duration && (
                <span className="text-xs font-medium text-ink/60 flex items-center gap-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {project.estimated_duration}
                </span>
              )}
            </div>

            {/* Fraunces Title */}
            <h3 className="font-display font-bold text-xl sm:text-2xl text-ink leading-snug mb-2 group-hover:text-sage-dark transition-colors line-clamp-1">
              {project.title}
            </h3>

            {/* Two-line Description */}
            {project.description && (
              <p className="font-body text-ink/75 text-sm leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}
          </div>

          {/* Card Link: "Preview project details →" */}
          <div className="mt-6 pt-4 border-t border-ink/5 flex items-center justify-between text-xs sm:text-sm font-semibold text-sage-dark">
            <span>Preview project details</span>
            <span
              className="group-hover:translate-x-1 transition-transform inline-block"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
