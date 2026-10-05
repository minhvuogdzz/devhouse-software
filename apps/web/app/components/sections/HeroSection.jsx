import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CtaLink } from '../ui/CtaLink.jsx';
import { getTranslation } from '../../lib/i18n.js';
import { GlobeBackground } from './GlobeBackground.jsx';
import { ScrollReveal } from '../ui/ScrollReveal.jsx';
import { WeatherHeroEffect } from './WeatherHeroEffect.jsx';
import { WeatherWidget } from './WeatherWidget.jsx';

export function HeroSection({
  eyebrow,
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  highlights = [],
  locale = 'vi',
}) {
  const [weatherCondition, setWeatherCondition] = useState('cloudy');
  const t = getTranslation(locale);

  return (
    <section className="relative isolate pt-24 pb-24 lg:pt-32 lg:pb-32 min-h-[85vh] flex flex-col justify-center bg-transparent overflow-hidden">
      <GlobeBackground className="-z-20 inset-0 h-full w-full opacity-70" />
      <WeatherHeroEffect condition={weatherCondition} className="-z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-15 bg-gradient-to-b from-bg/20 via-transparent to-bg/20"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal direction="up" className="max-w-3xl mx-auto text-center space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-subtle text-primary border border-border-subtle tracking-wide">
                <span>{eyebrow}</span>
              </div>
            )}
            <WeatherWidget
              locale={locale}
              currentCondition={weatherCondition}
              onConditionChange={setWeatherCondition}
            />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-fg tracking-tight leading-[1.15]">
            {heading}
          </h1>

          {subheading && (
            <p className="text-base sm:text-lg text-fg-muted leading-relaxed max-w-2xl mx-auto font-normal">
              {subheading}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <CtaLink
              link={primaryCta}
              locale={locale}
              fallbackUrl="/contact"
              size="md"
              variant="primary"
              className="w-full sm:w-auto"
            >
              {primaryCta?.label || t('common.contactUs')}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </CtaLink>
            <CtaLink
              link={secondaryCta}
              locale={locale}
              fallbackUrl="/services"
              size="md"
              variant="outline"
              className="w-full sm:w-auto"
            />
          </div>

          {/* Value highlights */}
          {highlights.length > 0 && (
            <ul className="pt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-fg-muted">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
