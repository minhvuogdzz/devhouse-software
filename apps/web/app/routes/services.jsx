import React from 'react';
import { useLoaderData } from 'react-router';
import { defaultCatalog, localize } from '@devhouse/content';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { localePrefix } from '../lib/navigation.js';
import { Badge } from '../components/ui/Badge.jsx';
import { ScrollReveal } from '../components/ui/ScrollReveal.jsx';
import { ServiceCard } from '../components/sections/ServiceCard.jsx';
import { CtaSection } from '../components/sections/CtaSection.jsx';

export async function loader({ request }) {
  const page = await loadPage('services-index', request);
  const services = await loadList(
    `/services?limit=50&locale=${page.locale}`,
    defaultCatalog.services.map(item => localize(item, page.locale)),
  );
  return { ...page, services };
}

export function meta({ data }) {
  return generateSeoMeta({
    title: data?.seo?.title || 'Dev House Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
  });
}

export default function ServicesPage() {
  const { sections, services, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const { hero, cta } = sections;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {isShown(hero) && (
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            {hero.eyebrow && <Badge variant="default">{hero.eyebrow}</Badge>}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-fg tracking-tight">
              {hero.heading}
            </h1>
            {hero.subheading && (
              <p className="text-base sm:text-lg text-fg-muted leading-relaxed">
                {hero.subheading}
              </p>
            )}
          </ScrollReveal>
        )}

        {services.length > 0 ? (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.map(service => (
              <li key={service._id || service.slug}>
                <ServiceCard service={service} prefix={prefix} t={t} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-fg-muted">
            {t('services.empty')}
          </p>
        )}
      </div>

      {isShown(cta) && (
        <div className="mt-12">
          <CtaSection
            heading={cta.heading}
            subheading={cta.subheading}
            primaryCta={cta.button}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
