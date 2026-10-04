import React, { useState } from 'react';
import { Button } from '../ui/Button.jsx';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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
  locale = 'vi',
}) {
  const [weatherCondition, setWeatherCondition] = useState('cloudy');
  const prefix = locale === 'en' ? '/en' : '';
  const primaryUrl = primaryCta?.url?.startsWith('/')
    ? `${prefix}${primaryCta.url}`.replace(/\/+/g, '/')
    : primaryCta?.url || `${prefix}/contact`;
  const secondaryUrl = secondaryCta?.url?.startsWith('/')
    ? `${prefix}${secondaryCta.url}`.replace(/\/+/g, '/')
    : secondaryCta?.url || `${prefix}/services`;

  const highlights =
    locale === 'en'
      ? ['Enterprise Architecture', 'Predictable Milestones', 'Dedicated Support']
      : ['Kiến trúc Chuẩn mực', 'Tiến độ Đảm bảo', 'Đồng hành Lâu dài'];

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
            {primaryCta && (
              <Button to={primaryUrl} size="md" variant="primary" className="w-full sm:w-auto">
                {primaryCta.label ||
                  (locale === 'en' ? 'Schedule a Consultation' : 'Tư vấn giải pháp')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {secondaryCta && (
              <Button to={secondaryUrl} size="md" variant="outline" className="w-full sm:w-auto">
                {secondaryCta.label || (locale === 'en' ? 'Explore Services' : 'Khám phá dịch vụ')}
              </Button>
            )}
          </div>

          {/* Value highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-fg-muted">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
