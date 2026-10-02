import React from 'react';

export function ProcessSection({ heading, subheading, steps = [] }) {
  return (
    <section className="py-16 lg:py-24 border-b border-border bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-fg tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="text-base sm:text-lg text-fg-muted leading-relaxed">{subheading}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl border border-border bg-bg/50 flex flex-col"
            >
              <div className="text-3xl font-black font-display text-primary/30 mb-4">
                {step.stepNumber || `0${index + 1}`}
              </div>
              <h3 className="text-lg font-bold font-display text-fg mb-2">{step.title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed flex-1">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
