import React from 'react';
import { useLoaderData } from 'react-router';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { localePrefix } from '../lib/navigation.js';
import { Badge } from '../components/ui/Badge.jsx';
import { ScrollReveal } from '../components/ui/ScrollReveal.jsx';
import { ProductShowcase } from '../components/sections/ProductShowcase.jsx';
import { CtaSection } from '../components/sections/CtaSection.jsx';

export async function loader({ request }) {
  const page = await loadPage('products-index', request);
  const products = await loadList(`/products?limit=100&locale=${page.locale}`, []);
  return { ...page, products };
}

export function meta({ data }) {
  return generateSeoMeta({
    title: data?.seo?.title || 'Dev House Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
  });
}

export default function ProductsPage() {
  const { sections, products, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const { hero, empty, cta } = sections;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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

        <ProductShowcase
          products={products}
          locale={locale}
          prefix={prefix}
          t={t}
          filterable
          empty={
            isShown(empty) ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-2">
                <h2 className="font-display text-lg font-bold text-fg">{empty.heading}</h2>
                <p className="mx-auto max-w-md text-sm text-fg-muted">{empty.text}</p>
              </div>
            ) : null
          }
        />
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
