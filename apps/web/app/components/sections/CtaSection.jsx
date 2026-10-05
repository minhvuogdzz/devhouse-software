import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CtaLink } from '../ui/CtaLink.jsx';
import { ScrollReveal } from '../ui/ScrollReveal.jsx';
import { getTranslation } from '../../lib/i18n.js';

/** Closing call to action. The button texts and links are edited in Admin → Pages. */
export function CtaSection({ heading, subheading, primaryCta, secondaryCta, locale = 'vi' }) {
  const t = getTranslation(locale);

  return (
    <section className="py-16 lg:py-20 bg-transparent border-b border-border">
      <ScrollReveal
        direction="up"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
      >
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-fg tracking-tight">
          {heading}
        </h2>
        {subheading && (
          <p className="text-base sm:text-lg text-fg-muted max-w-2xl mx-auto leading-relaxed">
            {subheading}
          </p>
        )}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <CtaLink
            link={primaryCta}
            locale={locale}
            fallbackUrl="/contact"
            size="lg"
            variant="primary"
            className="w-full sm:w-auto"
          >
            {primaryCta?.label || t('common.contactUs')}
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </CtaLink>
          <CtaLink
            link={secondaryCta}
            locale={locale}
            fallbackUrl="/about"
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
