import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'article';
}

export default function Card({
  as: Component = 'div',
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <Component
      className={`bg-white rounded-[28px] shadow-[0_4px_24px_rgba(46,42,54,0.06)] border border-ink/5 p-6 sm:p-8 transition-shadow ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
