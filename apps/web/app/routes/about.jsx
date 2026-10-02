import React from 'react';
import { useLoaderData, useRouteLoaderData, Link } from 'react-router';
import { resolveDefaultPage } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { OrgChart } from '../components/sections/OrgChart.jsx';
import {
  Shield,
  Target,
  Award,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  FileText,
  Globe,
  Building2,
  Cpu,
  Layers,
} from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let page;
  try {
    const res = await apiClient(`/pages/about?locale=${locale}`);
    page = res.data;
  } catch {
    page = null;
  }
  // Fill any section the API did not return from code defaults, so the page is never blank.
  const fallback = resolveDefaultPage('about', locale);
  const sections = { ...fallback.sections, ...(page?.sections || {}) };

  return { sections, seo: page?.seo || fallback.seo, locale };
}

export function meta({ data }) {
  const seo = data?.seo || {};
  return [
    { title: seo.title || 'Dev House Software' },
    { name: 'description', content: seo.description || '' },
  ];
}

const offeringIcons = [Globe, Building2, Cpu];
const valueIcons = [Shield, Target, Award];

export default function AboutPage() {
  const { sections, locale } = useLoaderData();
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';
  const phoneHref = (settings.hotline || '').replace(/[^+\d]/g, '');

  const { hero, company, leadership, mission, serviceTerms } = sections;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 lg:space-y-24">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <Badge variant="default">{t('header.nav.about')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
            {hero?.heading}
          </h1>
          <p className="text-lg sm:text-xl text-fg-muted leading-relaxed">{hero?.subheading}</p>
        </div>

        {/* Company */}
        {company && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
                {company.heading}
              </h2>
              <p className="text-base sm:text-lg text-fg leading-relaxed">{company.intro}</p>
              <p className="text-base text-fg-muted leading-relaxed">{company.groupNote}</p>
            </div>

            <div className="lg:col-span-5">
              <Card className="space-y-5 p-6 sm:p-8">
                <h3 className="text-lg font-bold font-display text-fg">
                  {locale === 'en' ? 'Company information' : 'Thông tin công ty'}
                </h3>
                <ul className="space-y-4 text-sm text-fg-muted">
                  {settings.legalName && (
                    <li className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden />
                      <span>{settings.legalName}</span>
                    </li>
                  )}
                  {settings.address && (
                    <li className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden />
                      <span>{settings.address}</span>
                    </li>
                  )}
                  {settings.contactEmail && (
                    <li className="flex items-start gap-3">
                      <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden />
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
                      <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden />
                      <a href={`tel:${phoneHref}`} className="hover:text-primary transition-colors">
                        {settings.hotline}
                      </a>
                    </li>
                  )}
                </ul>
              </Card>
            </div>

            {company.offerings?.length > 0 && (
              <div className="lg:col-span-12 space-y-6">
                <h3 className="text-xl font-bold font-display text-fg">
                  {company.offeringsHeading}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {company.offerings.map((item, idx) => {
                    const Icon = offeringIcons[idx % offeringIcons.length] || Layers;
                    return (
                      <Card key={idx} className="space-y-3">
                        <div className="w-11 h-11 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" aria-hidden />
                        </div>
                        <h4 className="text-base font-bold font-display text-fg">{item.title}</h4>
                        <p className="text-sm text-fg-muted leading-relaxed">{item.description}</p>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Organization chart */}
        {leadership?.nodes?.length > 0 && (
          <section className="space-y-10">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
                {leadership.heading}
              </h2>
              <p className="text-sm sm:text-base text-fg-muted">{leadership.subheading}</p>
            </div>
            <OrgChart nodes={leadership.nodes} />
          </section>
        )}

        {/* Core values */}
        {mission?.values?.length > 0 && (
          <section className="space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
                {mission.heading}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {mission.values.map((val, idx) => {
                const Icon = valueIcons[idx % valueIcons.length];
                return (
                  <Card key={idx} className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                      <Icon className="w-6 h-6" aria-hidden />
                    </div>
                    <h3 className="text-lg font-bold font-display text-fg">{val.title}</h3>
                    <p className="text-sm text-fg-muted leading-relaxed">{val.description}</p>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Service terms summary */}
        {serviceTerms?.items?.length > 0 && (
          <section className="rounded-2xl bg-surface-raised border border-border p-8 sm:p-12 space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
                {serviceTerms.heading}
              </h2>
              <p className="text-sm sm:text-base text-fg-muted">{serviceTerms.intro}</p>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              {serviceTerms.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-fg">{item.title}</h3>
                    <p className="text-sm text-fg-muted leading-relaxed">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              to={`${prefix}/terms`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {serviceTerms.linkLabel}
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </section>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-primary text-primary-fg p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary-fg">
              {locale === 'en'
                ? 'Have a project in mind?'
                : 'Bạn đang có một dự án cần triển khai?'}
            </h2>
            <p className="text-primary-fg/90 text-sm sm:text-base">
              {locale === 'en'
                ? 'Tell us what you need and we will reply with a clear plan and quote.'
                : 'Hãy cho chúng tôi biết nhu cầu của bạn, chúng tôi sẽ phản hồi bằng một kế hoạch và báo giá rõ ràng.'}
            </p>
          </div>
          <Button
            as={Link}
            to={`${prefix}/contact`}
            variant="secondary"
            size="lg"
            className="shrink-0"
          >
            {t('common.contactUs')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
