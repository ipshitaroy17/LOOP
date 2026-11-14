import React from 'react';
import { learningCurve } from '@/fonts';

export interface BrandProps {
  /**
   * HTML element to render. Defaults to 'span'.
   */
  as?: 'span' | 'h1' | 'h2' | 'p' | 'div';
  /**
   * Preset sizing tailored for script typography.
   * - 'inherit': Proportional text-[1.25em] for inline body text and headings.
   * - 'sm': Small badges or footer text (text-xl / text-2xl).
   * - 'nav': Standard navigation wordmark (text-3xl sm:text-4xl).
   * - 'auth': Auth pages header wordmark (text-4xl sm:text-5xl).
   * - 'hero': Hero landing section wordmark (text-7xl sm:text-8xl md:text-9xl).
   * - 'custom': Relies entirely on passed className.
   */
  size?: 'inherit' | 'sm' | 'nav' | 'auth' | 'hero' | 'custom';
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const sizeClasses: Record<NonNullable<BrandProps['size']>, string> = {
  inherit: 'text-[1.25em] leading-none px-0.5',
  sm: 'text-xl sm:text-2xl leading-none px-0.5',
  nav: 'text-3xl sm:text-4xl leading-none px-1',
  auth: 'text-4xl sm:text-5xl leading-none px-1',
  hero: 'text-7xl sm:text-8xl md:text-9xl leading-none px-2 py-1',
  custom: '',
};

export default function Brand({
  as: Component = 'span',
  size = 'inherit',
  className = '',
  style,
  'aria-label': ariaLabel,
}: BrandProps) {
  return (
    <Component
      className={`inline-block font-normal overflow-visible select-none align-baseline tracking-normal ${learningCurve.className} ${sizeClasses[size]} ${className}`}
      style={style}
      aria-label={ariaLabel}
    >
      loop
    </Component>
  );
}
