import React from 'react';
import { Button } from '../ui/Button.jsx';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlobeBackground } from './GlobeBackground.jsx';

export function HeroSection({
  eyebrow,
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  locale = 'vi',
}) {
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
    <section className="relative isolate overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-28 border-b border-border bg-gradient-to-b from-surface to-bg">
      <GlobeBackground className="-z-10" />
      {/* Fades the globe toward the page background so the text stays easy to read */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-bg/30 via-transparent to-bg/30"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-subtle text-primary border border-border-subtle tracking-wide">
              <span>{eyebrow}</span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-fg tracking-tight leading-[1.12]">
            {heading}
          </h1>

          {subheading && (
            <p className="text-lg sm:text-xl text-fg-muted leading-relaxed max-w-2xl mx-auto">
              {subheading}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryCta && (
              <Button to={primaryUrl} size="lg" variant="primary" className="w-full sm:w-auto">
                {primaryCta.label ||
                  (locale === 'en' ? 'Schedule a Consultation' : 'Tư vấn giải pháp')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
            {secondaryCta && (
              <Button to={secondaryUrl} size="lg" variant="outline" className="w-full sm:w-auto">
                {secondaryCta.label || (locale === 'en' ? 'Explore Services' : 'Khám phá dịch vụ')}
              </Button>
            )}
          </div>

          {/* Value highlights */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-fg-muted">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
