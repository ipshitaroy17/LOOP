import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'butter'
    | 'butter-light'
    | 'sage'
    | 'sage-light'
    | 'blush'
    | 'blush-light'
    | 'lilac'
    | 'lilac-light'
    | 'outline'
    | 'white';
  size?: 'sm' | 'md';
}

const variantClasses: Record<NonNullable<ChipProps['variant']>, string> = {
  default: 'bg-butter text-ink',
  butter: 'bg-butter text-ink',
  'butter-light': 'bg-butter-light text-ink',
  sage: 'bg-sage text-ink',
  'sage-light': 'bg-sage-light text-sage-dark',
  blush: 'bg-blush text-ink',
  'blush-light': 'bg-blush-light text-ink',
  lilac: 'bg-lilac text-ink',
  'lilac-light': 'bg-lilac-light text-ink',
  outline: 'bg-white border border-ink/15 text-ink',
  white: 'bg-white text-ink shadow-xs',
};

const sizeClasses = {
  sm: 'px-2.5 py-0.5 text-[11px] font-semibold',
  md: 'px-3 py-1 text-xs font-semibold',
};

export default function Chip({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
