import React from 'react';
import { normalizeDisplay } from '@devhouse/shared';
import { SectionHeading } from '../ui/SectionHeading.jsx';
import { Collection } from '../ui/Collection.jsx';
import { iconFor } from '../../lib/icons.js';

/** A numbered step. In a list the number sits beside the text. */
export function StepCard({ step, index, layout }) {
  const row = layout === 'list';
  return (
    <div
      className={`flex w-full gap-3 rounded-xl border border-border bg-surface p-5 ${
        row ? 'flex-row items-start gap-4' : 'h-full flex-col'
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-subtle font-display text-sm font-bold text-primary">
        {step.stepNumber || String(index + 1).padStart(2, '0')}
      </span>
      <div className="space-y-2">
        <h3 className="font-display text-base font-bold text-fg">{step.title}</h3>
        {step.description && (
          <p className="text-sm leading-relaxed text-fg-muted">{step.description}</p>
        )}
      </div>
    </div>
  );
}

/** One stop on the timeline: a circle with the step's icon (or its number), then the text. */
function TimelineStep({ step, index, horizontal }) {
  const number = step.stepNumber || String(index + 1).padStart(2, '0');
  const Icon = step.icon ? iconFor(step.icon) : null;
  return (
    <li
      className={`relative flex gap-4 ${horizontal ? 'lg:flex-col lg:items-center lg:text-center' : ''}`}
    >
      <span className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-surface text-primary shadow-sm">
        {Icon ? (
          <>
            <Icon className="h-7 w-7" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1 font-display text-[11px] font-bold text-primary-fg">
              {number}
            </span>
          </>
        ) : (
          <span className="font-display text-base font-bold">{number}</span>
        )}
      </span>
      <div className="space-y-2 pt-1 lg:pt-0">
        <h3 className="font-display text-base font-bold text-fg">{step.title}</h3>
        {step.duration && (
          <span className="inline-block rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-semibold text-primary">
            {step.duration}
          </span>
        )}
        {step.description && (
          <p className="text-sm leading-relaxed text-fg-muted">{step.description}</p>
        )}
      </div>
    </li>
  );
}

/**
 * The steps joined by a line: across the page on a computer when the admin chose a grid,
 * down the page on phones and when the admin chose a list.
 */
function ProcessTimeline({ steps, horizontal, label }) {
  return (
    <ol
      aria-label={label}
      style={{ '--steps': steps.length }}
      className={`relative mt-10 grid gap-8 ${
        horizontal ? 'lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-6' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute bottom-8 left-8 top-8 w-0.5 -translate-x-1/2 bg-border ${
          horizontal
            ? 'lg:bottom-auto lg:left-[calc(50%/var(--steps))] lg:right-[calc(50%/var(--steps))] lg:h-0.5 lg:w-auto lg:translate-x-0'
            : ''
        }`}
      />
      {steps.map((step, index) => (
        <TimelineStep
          key={`${step.title}-${index}`}
          step={step}
          index={index}
          horizontal={horizontal}
        />
      ))}
    </ol>
  );
}

/**
 * The working process. Grid and list show a timeline; a slide keeps the step cards.
 * The id lets the menu link straight to it (/#process).
 */
export function ProcessSection({ heading, subheading, steps = [], display }) {
  if (!steps.length) return null;
  const { layout } = normalizeDisplay(display);
  return (
    <section id="process" className="scroll-mt-24 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading heading={heading} subheading={subheading} align="center" />
        {layout === 'slide' ? (
          <Collection
            items={steps}
            display={display}
            label={heading}
            getKey={(step, index) => `${step.title}-${index}`}
            renderItem={(step, index, { layout: itemLayout }) => (
              <StepCard step={step} index={index} layout={itemLayout} />
            )}
          />
        ) : (
          <ProcessTimeline steps={steps} horizontal={layout === 'grid'} label={heading} />
        )}
      </div>
    </section>
  );
}
