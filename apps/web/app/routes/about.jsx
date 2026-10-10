import React from 'react';
import { Link, useLoaderData, useRouteLoaderData } from 'react-router';
import { ArrowRight, Building2, Mail, MapPin, Phone } from 'lucide-react';
import { loadPage, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { iconFor } from '../lib/icons.js';
import { resizedImage } from '../lib/images.js';
import { localePrefix, withLocale } from '../lib/navigation.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Collection } from '../components/ui/Collection.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { CtaSection } from '../components/sections/CtaSection.jsx';
import { ValueGrid } from '../components/sections/ValueGrid.jsx';

export async function loader({ request }) {
  return loadPage('about', request);
}

export function meta({ data }) {
  return generateSeoMeta({
    title: data?.seo?.title || 'Devhouse Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
  });
}

/** One of the company's services, linking to its page when the admin gave a path. */
function OfferingCard({ item, locale, t, layout }) {
  const Icon = iconFor(item.icon);
  const row = layout === 'list';
  return (
    <div
      className={`flex w-full gap-3 rounded-xl border border-border bg-surface p-5 sm:p-6 transition-colors hover:border-primary/40 ${
        row ? 'flex-row items-start gap-4' : 'h-full flex-col'
      }`}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <h3 className="font-display text-base font-bold text-fg">{item.title}</h3>
        <p className="text-sm leading-relaxed text-fg-muted">{item.description}</p>
        {item.path && (
          <Link
            to={withLocale(item.path, locale)}
            className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            {t('services.seeHow')}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

/** One picture of the company slider. */
function GalleryPicture({ entry, layout }) {
  const { image, caption } = entry;
  return (
    <figure className="w-full space-y-2">
      <img
        src={resizedImage(image.url, layout === 'list' ? 1200 : 800)}
        alt={image.alt || caption || ''}
        width={image.width || 800}
        height={image.height || 600}
        loading="lazy"
        decoding="async"
        className="aspect-[4/3] w-full rounded-xl border border-border object-cover"
      />
      {caption && <figcaption className="text-sm text-fg-muted">{caption}</figcaption>}
    </figure>
  );
}

export default function AboutPage() {
  const { sections, locale } = useLoaderData();
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const phoneHref = (settings.hotline || '').replace(/[^+\d]/g, '');
  const { hero, company, gallery, vision, offerings, values, serviceTerms, cta } = sections;
  const pictures = (gallery?.images || []).filter(entry => entry?.image?.url);

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 lg:space-y-24">
        {isShown(hero) && (
          <div className="max-w-3xl space-y-6">
            <Badge variant="default">{t('header.nav.about')}</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
              {hero.heading}
            </h1>
            <p className="text-lg sm:text-xl text-fg-muted leading-relaxed">{hero.subheading}</p>
          </div>
        )}

        {isShown(company) && (
          <section className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-5 lg:col-span-7">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
                {company.heading}
              </h2>
              {company.intro && (
                <p className="text-base sm:text-lg text-fg leading-relaxed">{company.intro}</p>
              )}
              {(company.paragraphs || []).map((paragraph, index) => (
                <p key={index} className="text-base text-fg-muted leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {company.groupNote && (
                <p className="border-l-2 border-primary/40 pl-4 text-sm text-fg-muted leading-relaxed">
                  {company.groupNote}
                </p>
              )}
            </div>

            <div className="lg:col-span-5">
              <Card hover={false} className="space-y-5 p-6 sm:p-8">
                <h3 className="text-lg font-bold font-display text-fg">{t('about.companyInfo')}</h3>
                <ul className="space-y-4 text-sm text-fg-muted">
                  {settings.legalName && (
                    <li className="flex items-start gap-3">
                      <Building2
                        className="w-4 h-4 mt-0.5 text-primary shrink-0"
                        aria-hidden="true"
                      />
                      <span>{settings.legalName}</span>
                    </li>
                  )}
                  {settings.address && (
                    <li className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                      <span>{settings.address}</span>
                    </li>
                  )}
                  {settings.contactEmail && (
                    <li className="flex items-start gap-3">
                      <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="hover:text-primary transition-colors"
                      >
                        {settings.contactEmail}
                      </a>
                    </li>
                  )}
                  {settings.hotline && (
                    <li className="flex items-start gap-3">
                      <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                      <a href={`tel:${phoneHref}`} className="hover:text-primary transition-colors">
                        {settings.hotline}
                      </a>
                    </li>
                  )}
                </ul>
              </Card>
            </div>
          </section>
        )}

        {isShown(gallery) && pictures.length > 0 && (
          <section>
            <SectionHeading heading={gallery.heading} subheading={gallery.subheading} />
            <Collection
              items={pictures}
              display={gallery.display}
              label={gallery.heading}
              getKey={(entry, index) => `${entry.image.url}-${index}`}
              renderItem={(entry, _index, { layout }) => (
                <GalleryPicture entry={entry} layout={layout} />
              )}
            />
          </section>
        )}

        {isShown(vision) && vision.items?.length > 0 && (
          <section>
            <SectionHeading heading={vision.heading} />
            <ValueGrid items={vision.items} display={vision.display} label={vision.heading} />
          </section>
        )}

        {isShown(offerings) && offerings.items?.length > 0 && (
          <section>
            <SectionHeading heading={offerings.heading} />
            <Collection
              items={offerings.items}
              display={offerings.display}
              label={offerings.heading}
              getKey={(item, index) => `${item.title}-${index}`}
              renderItem={(item, _index, { layout }) => (
                <OfferingCard item={item} locale={locale} t={t} layout={layout} />
              )}
            />
          </section>
        )}

        {isShown(values) && values.items?.length > 0 && (
          <section>
            <SectionHeading heading={values.heading} />
            <ValueGrid items={values.items} display={values.display} label={values.heading} />
          </section>
        )}

        {isShown(serviceTerms) && serviceTerms.items?.length > 0 && (
          <section className="rounded-2xl bg-surface-raised border border-border p-6 sm:p-10 space-y-8">
            <SectionHeading
              heading={serviceTerms.heading}
              subheading={serviceTerms.intro}
              className="!mb-0"
            />
            <ValueGrid
              items={serviceTerms.items}
              display={serviceTerms.display}
              label={serviceTerms.heading}
            />
            <Link
              to={`${prefix}/terms`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {serviceTerms.linkLabel}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </section>
        )}
      </div>

      {isShown(cta) && (
        <div className="mt-20 lg:mt-24">
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
