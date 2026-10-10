import React from 'react';
import { useLoaderData } from 'react-router';
import { defaultCatalog, localize, resolveDefaultServices } from '@devhouse/content';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { localePrefix } from '../lib/navigation.js';
import { Button } from '../components/ui/Button.jsx';
import { Collection } from '../components/ui/Collection.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { HeroSection } from '../components/sections/HeroSection.jsx';
import { ValueGrid } from '../components/sections/ValueGrid.jsx';
import { ServiceCard } from '../components/sections/ServiceCard.jsx';
import { ProductShowcase } from '../components/sections/ProductShowcase.jsx';
import { PackageCard } from '../components/sections/PackageCard.jsx';
import { ProcessSection } from '../components/sections/ProcessSection.jsx';
import { CtaSection } from '../components/sections/CtaSection.jsx';
import { ArrowRight } from 'lucide-react';

async function loadHomeProducts(locale) {
  const featured = await loadList(`/products?limit=10&featured=true&locale=${locale}`, []);
  if (featured.length > 0) return featured;
  return loadList(`/products?limit=10&locale=${locale}`, []);
}

export async function loader({ request }) {
  const page = await loadPage('home', request);
  const { locale } = page;

  // Code defaults are used only when the API cannot be reached.
  const [services, products, packages] = await Promise.all([
    loadList(
      `/services?limit=8&parent=none&locale=${locale}`,
      resolveDefaultServices(locale).filter(service => !service.parent),
    ),
    loadHomeProducts(locale),
    loadList(
      `/packages?limit=6&locale=${locale}`,
      defaultCatalog.packages.map(item => localize(item, locale)),
    ),
  ]);

  return { ...page, services, products, packages };
}

export function meta({ data }) {
  const origin = data?.url ? new URL(data.url).origin : 'https://devhouse.vn';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Devhouse Software',
    url: origin,
    logo: `${origin}/brand/logo-light.png`,
  };
  return generateSeoMeta({
    title: data?.seo?.title || 'Devhouse Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
    jsonLd,
  });
}

function SeeAll({ to, children }) {
  return (
    <Button to={to} variant="outline" size="sm" className="shrink-0">
      {children}
      <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
    </Button>
  );
}

export default function HomePage() {
  const { sections, services, products, packages, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const { hero, values, servicesIntro, productsIntro, audiences, packagesIntro, process, cta } =
    sections;

  return (
    <div>
      {isShown(hero) && (
        <HeroSection
          eyebrow={hero.eyebrow}
          heading={hero.heading}
          subheading={hero.subheading}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
          highlights={hero.highlights}
          locale={locale}
        />
      )}

      {isShown(values) && values.items?.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              heading={values.heading}
              subheading={values.subheading}
              align="center"
            />
            <ValueGrid items={values.items} display={values.display} label={values.heading} />
          </div>
        </section>
      )}

      {isShown(servicesIntro) && services.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.services')}
              heading={servicesIntro.heading}
              subheading={servicesIntro.subheading}
              action={<SeeAll to={`${prefix}/services`}>{t('common.exploreServices')}</SeeAll>}
            />
            <Collection
              items={services}
              display={servicesIntro.display}
              label={servicesIntro.heading}
              seeAllHref={`${prefix}/services`}
              getKey={service => service._id || service.slug}
              renderItem={(service, _index, { layout }) => (
                <ServiceCard service={service} prefix={prefix} t={t} layout={layout} />
              )}
            />
          </div>
        </section>
      )}

      {isShown(productsIntro) && products.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.products')}
              heading={productsIntro.heading}
              subheading={productsIntro.subheading}
              action={<SeeAll to={`${prefix}/products`}>{t('common.exploreProducts')}</SeeAll>}
            />
            <ProductShowcase
              products={products}
              locale={locale}
              prefix={prefix}
              t={t}
              display={productsIntro.display}
              seeAllHref={`${prefix}/products`}
            />
          </div>
        </section>
      )}

      {isShown(audiences) && audiences.items?.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              heading={audiences.heading}
              subheading={audiences.subheading}
              align="center"
            />
            <ValueGrid
              items={audiences.items}
              display={audiences.display}
              label={audiences.heading}
            />
          </div>
        </section>
      )}

      {isShown(packagesIntro) && packages.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.packages')}
              heading={packagesIntro.heading}
              subheading={packagesIntro.subheading}
              action={<SeeAll to={`${prefix}/packages`}>{t('common.explorePackages')}</SeeAll>}
            />
            <div className="pt-3">
              <Collection
                items={packages}
                display={packagesIntro.display}
                label={packagesIntro.heading}
                gap="lg"
                getKey={pack => pack._id || pack.slug}
                renderItem={pack => (
                  <PackageCard pack={pack} locale={locale} prefix={prefix} t={t} />
                )}
              />
            </div>
          </div>
        </section>
      )}

      {isShown(process) && (
        <ProcessSection
          heading={process.heading}
          subheading={process.subheading}
          steps={process.steps}
          display={process.display}
        />
      )}

      {isShown(cta) && (
        <CtaSection
          heading={cta.heading}
          subheading={cta.subheading}
          primaryCta={cta.primaryCta}
          secondaryCta={cta.secondaryCta}
          locale={locale}
        />
      )}
    </div>
  );
}
