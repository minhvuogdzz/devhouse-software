import React from 'react';
import { Link, useLoaderData } from 'react-router';
import { resolveDefaultServices } from '@devhouse/content';
import { ArrowRight } from 'lucide-react';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { iconFor } from '../lib/icons.js';
import { localePrefix } from '../lib/navigation.js';
import { groupServices } from '../lib/services.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Collection } from '../components/ui/Collection.jsx';
import { ScrollReveal } from '../components/ui/ScrollReveal.jsx';
import { ServiceCard } from '../components/sections/ServiceCard.jsx';
import { CtaSection } from '../components/sections/CtaSection.jsx';

export async function loader({ request }) {
  const page = await loadPage('services-index', request);
  const services = await loadList(
    `/services?limit=100&locale=${page.locale}`,
    resolveDefaultServices(page.locale),
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
  const { hero, list, cta } = sections;
  const { grouped, orphans } = groupServices(services);

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
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

        {services.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-fg-muted">
            {t('services.empty')}
          </p>
        )}

        {grouped.map(({ group, types }) => {
          const Icon = iconFor(group.icon);
          return (
            <section key={group._id || group.slug} aria-labelledby={`group-${group.slug}`}>
              <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div className="max-w-2xl space-y-1">
                    <h2
                      id={`group-${group.slug}`}
                      className="font-display text-2xl font-bold tracking-tight text-fg"
                    >
                      {group.name}
                    </h2>
                    {group.shortDescription && (
                      <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
                        {group.shortDescription}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  to={`${prefix}/services/${group.slug}`}
                  className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
                >
                  {t('services.seeHow')}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </header>

              <Collection
                items={types}
                display={list?.display}
                label={group.name}
                getKey={item => item._id || item.slug}
                renderItem={(item, _index, { layout }) => (
                  <ServiceCard service={item} prefix={prefix} t={t} layout={layout} />
                )}
              />
            </section>
          );
        })}

        {orphans.length > 0 && (
          <Collection
            items={orphans}
            display={list?.display}
            label={t('header.nav.services')}
            getKey={item => item._id || item.slug}
            renderItem={(item, _index, { layout }) => (
              <ServiceCard service={item} prefix={prefix} t={t} layout={layout} />
            )}
          />
        )}
      </div>

      {isShown(cta) && (
        <div className="mt-14">
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
