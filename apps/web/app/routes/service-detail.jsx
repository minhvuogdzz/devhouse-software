import React from 'react';
import { Link, useLoaderData } from 'react-router';
import { resolveDefaultServices } from '@devhouse/content';
import { ArrowRight, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react';
import { apiClient } from '../lib/api-client.js';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getLocaleFromUrl, getTranslation } from '../lib/i18n.js';
import { localePrefix } from '../lib/navigation.js';
import { iconFor } from '../lib/icons.js';
import { resizedImage } from '../lib/images.js';
import { Button } from '../components/ui/Button.jsx';
import { Collection } from '../components/ui/Collection.jsx';
import { ServiceCard } from '../components/sections/ServiceCard.jsx';
import { StepCard } from '../components/sections/ProcessSection.jsx';
import { ValueGrid } from '../components/sections/ValueGrid.jsx';

export async function loader({ params, request }) {
  const locale = getLocaleFromUrl(request.url);
  const { slug } = params;

  let service = null;
  let apiReachable = true;
  try {
    const res = await apiClient(`/services/${slug}?locale=${locale}`);
    service = res.data;
  } catch (error) {
    // A missing service is a real 404; only an unreachable API falls back to the code defaults.
    if (error.status !== 404) {
      apiReachable = false;
      service = resolveDefaultServices(locale).find(item => item.slug === slug) || null;
    }
  }

  if (!service) {
    throw new Response('Service Not Found', { status: 404 });
  }

  // A group lists the kinds of service inside it
  const types = service.parent
    ? []
    : await loadList(
        `/services?parent=${encodeURIComponent(service.slug)}&limit=100&locale=${locale}`,
        apiReachable
          ? []
          : resolveDefaultServices(locale).filter(item => item.parent?.slug === slug),
      );

  const page = await loadPage('service-detail', request);
  return { service, types, sections: page.sections, url: request.url, locale };
}

export function meta({ data }) {
  if (!data?.service) return [{ title: 'Dev House Software' }];
  const { service } = data;
  const title = service.seo?.title || `${service.name} — Dev House Software`;
  const description = service.seo?.description || service.shortDescription || '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description,
    provider: { '@type': 'Organization', name: 'Dev House Software' },
  };

  return generateSeoMeta({
    title,
    description,
    url: data.url,
    locale: data.locale,
    type: 'website',
    jsonLd,
  });
}

export default function ServiceDetailPage() {
  const { service, types, sections, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const Icon = iconFor(service.icon);
  const interest = encodeURIComponent(service.name);
  const features = service.features || [];
  const steps = service.process || [];
  const faqs = (service.faqs || []).filter(faq => faq.question);
  const { types: typesSection, features: featuresSection, process: processSection } = sections;

  return (
    <div className="py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <nav
          aria-label="breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-fg-subtle"
        >
          <Link to={prefix || '/'} className="hover:text-fg">
            {t('header.nav.home')}
          </Link>
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <Link to={`${prefix}/services`} className="hover:text-fg">
            {t('header.nav.services')}
          </Link>
          {service.parent && (
            <>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
              <Link to={`${prefix}/services/${service.parent.slug}`} className="hover:text-fg">
                {service.parent.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3" aria-hidden="true" />
          <span className="text-fg font-medium" aria-current="page">
            {service.name}
          </span>
        </nav>

        <header className="grid gap-8 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-subtle text-primary">
                <Icon className="w-7 h-7" aria-hidden="true" />
              </span>
              {service.billing && (
                <span className="rounded-full border border-border-subtle bg-surface-2 px-3 py-1 text-xs font-medium text-fg-muted">
                  {t(`services.billing.${service.billing}`)}
                </span>
              )}
              {service.parent && (
                <Link
                  to={`${prefix}/services/${service.parent.slug}`}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium text-fg-muted hover:text-fg"
                >
                  {t('services.parentLink')}: {service.parent.name}
                </Link>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
              {service.name}
            </h1>
            {service.shortDescription && (
              <p className="text-lg sm:text-xl text-fg-muted leading-relaxed">
                {service.shortDescription}
              </p>
            )}
            <div className="pt-1 flex flex-wrap gap-3">
              <Button to={`${prefix}/contact?interest=${interest}`} size="lg">
                {t('services.askAbout')}
              </Button>
              <Button to={`${prefix}/packages`} size="lg" variant="outline">
                {t('services.seePackages')}
              </Button>
            </div>
          </div>

          {service.image?.url && (
            <img
              src={resizedImage(service.image.url, 900)}
              alt={service.image.alt || ''}
              width={service.image.width || 900}
              height={service.image.height || 506}
              decoding="async"
              className="aspect-video w-full rounded-xl border border-border object-cover"
            />
          )}
        </header>

        {service.description && (
          <div className="max-w-3xl text-base leading-relaxed text-fg-muted whitespace-pre-line">
            {service.description}
          </div>
        )}

        {types.length > 0 && isShown(typesSection) && (
          <section className="space-y-6 pt-6 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg">
              {typesSection.heading || t('services.typesIn')}
            </h2>
            <Collection
              items={types}
              display={typesSection.display}
              label={typesSection.heading || t('services.typesIn')}
              getKey={item => item._id || item.slug}
              renderItem={(item, _index, { layout }) => (
                <ServiceCard service={item} prefix={prefix} t={t} layout={layout} />
              )}
            />
          </section>
        )}

        {steps.length > 0 && isShown(processSection) && (
          <section className="space-y-6 pt-6 border-t border-border">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl font-bold font-display text-fg">{processSection.heading}</h2>
              {processSection.subheading && (
                <p className="text-sm text-fg-muted sm:text-base">{processSection.subheading}</p>
              )}
            </div>
            <Collection
              items={steps}
              display={processSection.display}
              label={processSection.heading}
              getKey={(step, index) => `${step.title}-${index}`}
              renderItem={(step, index, { layout }) => (
                <StepCard step={step} index={index} layout={layout} />
              )}
            />
          </section>
        )}

        {features.length > 0 && isShown(featuresSection) && (
          <section className="space-y-6 pt-6 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg">
              {featuresSection.heading || t('services.includes')}
            </h2>
            <ValueGrid
              items={features.map(item => ({ ...item, icon: 'check' }))}
              display={featuresSection.display}
              label={featuresSection.heading}
            />
          </section>
        )}

        {faqs.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" aria-hidden="true" />
              {t('services.faq')}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-xl border border-border bg-surface open:border-primary/40"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-display text-base font-bold text-fg">
                    {faq.question}
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-fg-subtle transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-fg-muted whitespace-pre-line">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface-raised p-8 text-center sm:p-12 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
            {t('services.ctaTitle')}
          </h2>
          <p className="mx-auto max-w-xl text-base text-fg-muted">{t('services.ctaText')}</p>
          <div className="pt-2">
            <Button to={`${prefix}/contact?interest=${interest}`} size="lg">
              {t('services.askAbout')}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
