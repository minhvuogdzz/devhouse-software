import React from 'react';
import { useLoaderData } from 'react-router';
import { defaultCatalog, localize } from '@devhouse/content';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { localePrefix } from '../lib/navigation.js';
import { Badge } from '../components/ui/Badge.jsx';
import { ScrollReveal } from '../components/ui/ScrollReveal.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { Collection } from '../components/ui/Collection.jsx';
import { PackageCard } from '../components/sections/PackageCard.jsx';
import { ValueGrid } from '../components/sections/ValueGrid.jsx';

export async function loader({ request }) {
  const page = await loadPage('packages-index', request);
  // Code defaults only when the API cannot be reached; an admin who hides every package gets none.
  const packages = await loadList(
    `/packages?limit=20&locale=${page.locale}`,
    defaultCatalog.packages.map(pack => localize(pack, page.locale)),
  );
  return { ...page, packages };
}

export function meta({ data }) {
  return generateSeoMeta({
    title: data?.seo?.title || 'Dev House Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
  });
}

export default function PackagesPage() {
  const { sections, packages, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const { hero, list, payment, commitments } = sections;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-20">
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

        {packages.length > 0 ? (
          <div className="pt-3">
            <Collection
              items={packages}
              display={list?.display}
              label={t('header.nav.packages')}
              gap="lg"
              getKey={pack => pack._id || pack.slug}
              renderItem={pack => <PackageCard pack={pack} locale={locale} prefix={prefix} t={t} />}
            />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-fg-muted">
            {t('packages.empty')}
          </p>
        )}

        {isShown(payment) && payment.items?.length > 0 && (
          <section>
            <SectionHeading heading={payment.heading} />
            <ValueGrid items={payment.items} display={payment.display} label={payment.heading} />
          </section>
        )}

        {isShown(commitments) && commitments.items?.length > 0 && (
          <section>
            <SectionHeading heading={commitments.heading} subheading={commitments.intro} />
            <ValueGrid
              items={commitments.items}
              display={commitments.display}
              label={commitments.heading}
            />
          </section>
        )}
      </div>
    </div>
  );
}
