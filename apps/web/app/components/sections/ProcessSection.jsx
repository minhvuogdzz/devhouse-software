import React from 'react';
import { SectionHeading } from '../ui/SectionHeading.jsx';
import { Collection } from '../ui/Collection.jsx';

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

/** The working process as numbered steps. The id lets the menu link straight to it (/#process). */
export function ProcessSection({ heading, subheading, steps = [], display }) {
  if (!steps.length) return null;
  return (
    <section id="process" className="scroll-mt-24 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading heading={heading} subheading={subheading} align="center" />
        <Collection
          items={steps}
          display={display}
          label={heading}
          getKey={(step, index) => `${step.title}-${index}`}
          renderItem={(step, index, { layout }) => (
            <StepCard step={step} index={index} layout={layout} />
          )}
        />
      </div>
    </section>
  );
}
