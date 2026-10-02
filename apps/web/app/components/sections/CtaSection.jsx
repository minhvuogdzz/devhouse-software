import React from 'react';
import { Button } from '../ui/Button.jsx';
import { ArrowRight } from 'lucide-react';

export function CtaSection({ heading, subheading, primaryCta, secondaryCta, locale = 'vi' }) {
  const prefix = locale === 'en' ? '/en' : '';
  const primaryUrl = primaryCta?.url?.startsWith('/')
    ? `${prefix}${primaryCta.url}`.replace(/\/+/g, '/')
    : primaryCta?.url || `${prefix}/contact`;
  const secondaryUrl = secondaryCta?.url?.startsWith('/')
    ? `${prefix}${secondaryCta.url}`.replace(/\/+/g, '/')
    : secondaryCta?.url || `${prefix}/about`;

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-surface to-surface-2 border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-fg tracking-tight">
          {heading}
        </h2>
        {subheading && (
          <p className="text-base sm:text-xl text-fg-muted max-w-2xl mx-auto leading-relaxed">
            {subheading}
          </p>
        )}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCta && (
            <Button to={primaryUrl} size="lg" variant="primary" className="w-full sm:w-auto">
              {primaryCta.label || (locale === 'en' ? 'Contact Us' : 'Tư vấn dự án')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          {secondaryCta && (
            <Button to={secondaryUrl} size="lg" variant="outline" className="w-full sm:w-auto">
              {secondaryCta.label || (locale === 'en' ? 'About Us' : 'Xem năng lực')}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
