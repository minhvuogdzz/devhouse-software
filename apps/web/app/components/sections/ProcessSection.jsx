import React from 'react';
import { SectionHeading } from '../ui/SectionHeading.jsx';
import { ScrollReveal } from '../ui/ScrollReveal.jsx';

/** The working process as numbered steps. The id lets the menu link straight to it (/#process). */
export function ProcessSection({ heading, subheading, steps = [] }) {
  if (!steps.length) return null;
  return (
    <section id="process" className="scroll-mt-24 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading heading={heading} subheading={subheading} align="center" />

        <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li
              key={`${step.title}-${index}`}
              className="relative flex lg:[&:not(:last-child)]:after:absolute lg:[&:not(:last-child)]:after:left-full lg:[&:not(:last-child)]:after:top-10 lg:[&:not(:last-child)]:after:h-px lg:[&:not(:last-child)]:after:w-6 lg:[&:not(:last-child)]:after:bg-border lg:[&:not(:last-child)]:after:content-['']"
            >
              <ScrollReveal
                direction="up"
                delay={Math.min(index, 4) * 0.08}
                className="flex w-full"
              >
                <div className="flex w-full flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle font-display text-sm font-bold text-primary">
                    {step.stepNumber || String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-base font-bold text-fg">{step.title}</h3>
                  <p className="flex-1 text-sm leading-relaxed text-fg-muted">{step.description}</p>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
