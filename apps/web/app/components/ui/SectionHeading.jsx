import React from 'react';
import { ScrollReveal } from './ScrollReveal.jsx';

/** Eyebrow, title and short intro for a section; an optional action sits on the right. */
export function SectionHeading({
  eyebrow,
  heading,
  subheading,
  align = 'left',
  as: Tag = 'h2',
  action = null,
  className = '',
}) {
  const centered = align === 'center';
  return (
    <ScrollReveal
      direction="up"
      className={`mb-8 lg:mb-10 flex flex-col gap-4 ${
        centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
      } ${className}`}
    >
      <div className={`space-y-3 ${centered ? 'max-w-3xl' : 'max-w-2xl'}`}>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <Tag className="text-2xl sm:text-3xl font-bold font-display text-fg tracking-tight">
          {heading}
        </Tag>
        {subheading && (
          <p className="text-sm sm:text-base text-fg-muted leading-relaxed">{subheading}</p>
        )}
      </div>
      {action}
    </ScrollReveal>
  );
}
