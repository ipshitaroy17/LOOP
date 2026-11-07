'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Project } from '@/lib/catalogue/types';
import { getCategoryLabel, getDifficultyLabel } from '@/lib/catalogue/categories';

interface ProjectCardProps {
  project: Project;
  priority?: boolean;
}

export default function ProjectCard({ project, priority = false }: ProjectCardProps) {
  const [imgSrc, setImgSrc] = useState(
    project.thumbnail_url || '/illustrations/projects/project-placeholder.svg'
  );

  const difficultyColor = (() => {
    switch (project.difficulty) {
      case 'beginner':
        return { bg: '#E8F3E5', text: '#2C5A24', border: '#7C9A6B' };
      case 'easy':
        return { bg: '#FEF9E7', text: '#7D5A08', border: '#F5D87E' };
      case 'intermediate':
        return { bg: '#F4EEF8', text: '#552D75', border: '#C3B1D4' };
      case 'advanced':
        return { bg: '#FDF2F2', text: '#8A2020', border: '#E8B4B8' };
      default:
        return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
    }
  })();

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C9A6B] focus-visible:ring-offset-2 rounded-2xl flex-1 flex flex-col"
        aria-label={`View project details for ${project.title}`}
      >
        {/* Project Illustration Header */}
        <div className="relative w-full aspect-[4/3] bg-[#F4EFE6] overflow-hidden flex items-center justify-center">
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

          {/* Tutorial Coming Soon Badge */}
          <div className="absolute top-3 right-3">
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-sm"
              style={{
                backgroundColor: 'rgba(250, 247, 240, 0.95)',
                color: 'var(--color-charcoal)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 inline-block" />
              Tutorial coming soon
            </span>
          </div>

          {/* Category Pill */}
          <div className="absolute bottom-3 left-3">
            <span
              className="inline-block px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                color: 'var(--color-charcoal)',
              }}
            >
              {getCategoryLabel(project.category)}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: difficultyColor.bg,
                  color: difficultyColor.text,
                }}
              >
                {getDifficultyLabel(project.difficulty)}
              </span>

              {project.estimated_duration && (
                <span
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--color-charcoal-soft)' }}
                >
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

            <h3
              className="text-lg font-bold tracking-tight mb-2 group-hover:text-[#7C9A6B] transition-colors line-clamp-1"
              style={{ color: 'var(--color-charcoal)' }}
            >
              {project.title}
            </h3>

            {project.description && (
              <p
                className="text-sm line-clamp-2 leading-relaxed"
                style={{ color: 'var(--color-charcoal-soft)' }}
              >
                {project.description}
              </p>
            )}
          </div>

          {/* Card Footer Link Prompt */}
          <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold">
            <span style={{ color: 'var(--color-sage)' }}>Preview project details</span>
            <span
              className="group-hover:translate-x-1 transition-transform inline-block"
              style={{ color: 'var(--color-sage)' }}
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

