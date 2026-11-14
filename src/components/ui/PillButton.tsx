import React from 'react';
import Link from 'next/link';

export interface PillButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  asLink?: boolean;
}

const variantClasses = {
  primary:
    'bg-sage text-ink border border-transparent hover:bg-sage-dark hover:text-white active:brightness-95',
  outline:
    'border border-ink text-ink bg-transparent hover:bg-ink hover:text-cream active:bg-ink/90',
};

const sizeClasses = {
  sm: 'px-4 py-1.5 text-xs font-semibold',
  md: 'px-6 py-2.5 text-sm font-semibold',
  lg: 'px-8 py-3.5 text-base font-semibold',
};

export default function PillButton({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  ...buttonProps
}: PillButtonProps) {
  const baseClasses = `inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...buttonProps}>
      {children}
    </button>
  );
}
