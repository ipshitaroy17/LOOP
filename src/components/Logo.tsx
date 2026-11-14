import React from 'react';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  'aria-label'?: string;
}

const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-xl',
  md: 'text-2xl sm:text-3xl',
  lg: 'text-3xl sm:text-4xl',
  xl: 'text-5xl sm:text-6xl md:text-7xl',
};

export default function Logo({
  size = 'md',
  className = '',
  'aria-label': ariaLabel = 'loop',
}: LogoProps) {
  return (
    <span
      className={`inline-flex items-center font-display font-bold text-ink tracking-tight select-none ${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel}
      role="img"
    >
      <span className="leading-none">l</span>
      <svg
        viewBox="0 0 50 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[0.58em] w-auto mx-[0.04em] shrink-0 translate-y-[0.06em]"
        aria-hidden="true"
      >
        {/* Left ring: blush #F6B8C6 */}
        <circle
          cx="17.5"
          cy="18"
          r="14"
          stroke="#F6B8C6"
          strokeWidth="7"
        />
        {/* Right ring: butter #F7E08F */}
        <circle
          cx="32.5"
          cy="18"
          r="14"
          stroke="#F7E08F"
          strokeWidth="7"
        />
      </svg>
      <span className="leading-none">p</span>
    </span>
  );
}
