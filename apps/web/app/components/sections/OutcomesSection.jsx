import React from 'react';
import { Card } from '../ui/Card.jsx';
import { ShieldCheck, Target, HeartHandshake } from 'lucide-react';
import { ScrollReveal } from '../ui/ScrollReveal.jsx';
import { Marquee } from '../ui/Marquee.jsx';

export function OutcomesSection({ heading, subheading, items = [] }) {
  const defaultIcons = [Target, ShieldCheck, HeartHandshake];

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

        <ScrollReveal direction="left" delay={0.2}>
          <Marquee speed={40}>
            {items.map((item, index) => {
              const Icon = defaultIcons[index % defaultIcons.length];
              return (
                <Card key={index} className="flex flex-col h-full bg-surface p-6 min-w-[320px] max-w-[350px]">
                  <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-fg mb-2">{item.title}</h3>
                  <p className="text-sm text-fg-muted leading-relaxed flex-1">{item.description}</p>
                  {item.metric && (
                    <div className="mt-4 pt-4 border-t border-border-subtle text-xs font-semibold text-primary">
                      {item.metric}
                    </div>
                  )}
                </Card>
              );
            })}
          </Marquee>
        </ScrollReveal>
      </div>
    </section>
  );
}
