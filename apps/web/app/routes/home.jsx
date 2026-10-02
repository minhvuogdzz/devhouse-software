import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultPages, defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { HeroSection } from '../components/sections/HeroSection.jsx';
import { OutcomesSection } from '../components/sections/OutcomesSection.jsx';
import { ProcessSection } from '../components/sections/ProcessSection.jsx';
import { CtaSection } from '../components/sections/CtaSection.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ArrowRight, Layers, Cpu, Briefcase } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  let services = [];
  let solutions = [];
  let projects = [];

  try {
    const pageRes = await apiClient(`/pages/home?locale=${locale}`);
    pageData = pageRes.data?.resolved || pageRes.data;
  } catch {
    pageData = defaultPages.home;
  }

  try {
    const sRes = await apiClient(`/services?limit=6&locale=${locale}`);
    services = sRes.data || [];
  } catch {
    services = defaultCatalog.services.map(s => localize(s, locale));
  }

  try {
    const solRes = await apiClient(`/solutions?limit=4&locale=${locale}`);
    solutions = solRes.data || [];
  } catch {
    solutions = defaultCatalog.solutions.map(s => localize(s, locale));
  }

  try {
    const pRes = await apiClient(`/projects?limit=3&locale=${locale}`);
    projects = pRes.data || [];
  } catch {
    projects = [];
  }

  return {
    pageData: localize(pageData, locale),
    services,
    solutions,
    projects,
    locale,
  };
}

export function meta({ data }) {
  const locale = data?.locale || 'vi';
  const isEn = locale === 'en';

  return [
    {
      title: isEn
        ? 'Dev House Software — Enterprise Engineering & AI Solutions'
        : 'Dev House Software — Phát triển Phần mềm Doanh nghiệp & Giải pháp AI',
    },
    {
      name: 'description',
      content: isEn
        ? 'Custom enterprise software development, modern operational platforms, and specialized digital solutions.'
        : 'Tư vấn và phát triển phần mềm theo yêu cầu, hệ thống quản trị doanh nghiệp và giải pháp số chuyên sâu.',
    },
  ];
}

export default function HomePage() {
  const { pageData, services, solutions, projects, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero || defaultPages.home.defaults.hero;
  const outcomes = pageData.sections?.outcomes || defaultPages.home.defaults.outcomes;
  const process = pageData.sections?.process || defaultPages.home.defaults.process;
  const cta = pageData.sections?.cta || defaultPages.home.defaults.cta;

  return (
    <div>
      {/* 1. Hero */}
      <HeroSection
        eyebrow={hero.eyebrow}
        heading={hero.heading}
        subheading={hero.subheading}
        primaryCta={hero.primaryCta}
        secondaryCta={hero.secondaryCta}
        locale={locale}
      />

      {/* 2. Featured Services */}
      {services.length > 0 && (
        <section className="py-16 lg:py-24 border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="default" className="mb-3">
                  {t('header.nav.services')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold font-display text-fg tracking-tight">
                  {locale === 'en'
                    ? 'Engineered for Performance & Scale'
                    : 'Năng lực Cốt lõi & Chuyên sâu'}
                </h2>
              </div>
              <Button to={`${prefix}/services`} variant="outline" size="sm">
                {t('common.exploreServices')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map(service => (
                <Card key={service._id || service.slug} className="flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-fg">
                      {service.name || service.title}
                    </h3>
                    <p className="text-sm text-fg-muted leading-relaxed line-clamp-3">
                      {service.summary || service.description}
                    </p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-border-subtle">
                    <Link
                      to={`${prefix}/services/${service.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover gap-1.5"
                    >
                      {t('common.viewDetails')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Value Commitments (Outcomes) */}
      <OutcomesSection
        heading={outcomes.heading}
        subheading={outcomes.subheading}
        items={outcomes.items}
      />

      {/* 4. Solutions */}
      {solutions.length > 0 && (
        <section className="py-16 lg:py-24 border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <Badge variant="accent" className="mb-2">
                {t('header.nav.solutions')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold font-display text-fg tracking-tight">
                {locale === 'en'
                  ? 'Packaged Solutions for Business Acceleration'
                  : 'Giải pháp Đóng gói Tối ưu Chi phí & Thời gian'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {solutions.map(sol => (
                <Card key={sol._id || sol.slug} className="p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold font-display text-fg">
                      {sol.name || sol.title}
                    </h3>
                    <p className="text-base text-fg-muted leading-relaxed">
                      {sol.summary || sol.description}
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-border-subtle">
                    <Link
                      to={`${prefix}/solutions/${sol.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-accent hover:opacity-80 gap-1.5"
                    >
                      {t('common.viewDetails')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Process Framework */}
      <ProcessSection
        heading={process.heading}
        subheading={process.subheading}
        steps={process.steps}
      />

      {/* 6. Featured Projects (Case Studies) */}
      {projects.length > 0 && (
        <section className="py-16 lg:py-24 border-b border-border bg-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <Badge variant="default" className="mb-3">
                  {t('header.nav.projects')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold font-display text-fg tracking-tight">
                  {locale === 'en' ? 'Featured Case Studies' : 'Dự án Tiêu biểu'}
                </h2>
              </div>
              <Button to={`${prefix}/projects`} variant="outline" size="sm">
                {t('common.exploreProjects')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map(proj => (
                <Card key={proj._id || proj.slug} className="flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-fg">{proj.title}</h3>
                    <p className="text-sm text-fg-muted line-clamp-3 leading-relaxed">
                      {proj.summary}
                    </p>
                  </div>
                  <div className="pt-6 mt-4 border-t border-border-subtle">
                    <Link
                      to={`${prefix}/projects/${proj.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover gap-1.5"
                    >
                      {t('common.viewDetails')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Call to Action */}
      <CtaSection
        heading={cta.heading}
        subheading={cta.subheading}
        primaryCta={cta.primaryCta}
        secondaryCta={cta.secondaryCta}
        locale={locale}
      />
    </div>
  );
}
