import React from 'react';
import { Card } from '../ui/Card.jsx';
import { ShieldCheck, Target, HeartHandshake } from 'lucide-react';

export function OutcomesSection({ heading, subheading, items = [] }) {
  const defaultIcons = [Target, ShieldCheck, HeartHandshake];

  return (
    <section className="py-16 lg:py-24 border-b border-border bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-fg tracking-tight">
            {heading}
          </h2>
          {subheading && (
            <p className="text-base sm:text-lg text-fg-muted leading-relaxed">{subheading}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const Icon = defaultIcons[index % defaultIcons.length];
            return (
              <Card key={index} className="flex flex-col h-full bg-surface p-8">
                <div className="w-12 h-12 rounded-lg bg-primary-subtle text-primary flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold font-display text-fg mb-3">{item.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed flex-1">{item.description}</p>
                {item.metric && (
                  <div className="mt-4 pt-4 border-t border-border-subtle text-xs font-semibold text-primary">
                    {item.metric}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
