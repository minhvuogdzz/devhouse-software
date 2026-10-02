import React from 'react';
import { ScrollReveal } from '../ui/ScrollReveal.jsx';
import { Marquee } from '../ui/Marquee.jsx';

export function ProcessSection({ heading, subheading, steps = [] }) {
  return (
    <section className="py-12 lg:py-16 border-b border-border bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg tracking-tight">
              {heading}
            </h2>
            {subheading && (
              <p className="text-sm sm:text-base text-fg-muted leading-relaxed">{subheading}</p>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delay={0.2}>
          <Marquee speed={45} direction="right">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative p-6 rounded-xl border border-border bg-surface flex flex-col min-w-[300px] max-w-[320px]"
              >
                <div className="text-2xl font-black font-display text-primary/30 mb-3">
                  {step.stepNumber || `0${index + 1}`}
                </div>
                <h3 className="text-base font-bold font-display text-fg mb-2">{step.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed flex-1">{step.description}</p>
              </div>
            ))}
          </Marquee>
        </ScrollReveal>
      </div>
    </section>
  );
}
