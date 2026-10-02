import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultPages, defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  let projects = [];

  try {
    const pageRes = await apiClient(`/pages/projects-index?locale=${locale}`);
    pageData = pageRes.data?.resolved || pageRes.data;
  } catch {
    pageData = defaultPages['projects-index'];
  }

  try {
    const pRes = await apiClient(`/projects?limit=20&locale=${locale}`);
    projects = pRes.data || [];
  } catch {
    projects = defaultCatalog.projects ? defaultCatalog.projects.map(p => localize(p, locale)) : [];
  }

  return {
    pageData: localize(pageData, locale),
    projects,
    locale,
  };
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  return [
    {
      title: isEn
        ? 'Case Studies & Engineering Projects — Dev House Software'
        : 'Dự án Tiêu biểu & Câu chuyện Khách hàng — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'Explore how we engineer robust systems, digital platforms, and software solutions for our clients.'
        : 'Khám phá các hệ thống phần mềm và nền tảng số được Dev House thiết kế và triển khai thực tế.',
    },
  ];
}

export default function ProjectsPage() {
  const { pageData, projects, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero || defaultPages['projects-index'].defaults.hero;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="default">{t('header.nav.projects')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight">
            {hero.heading}
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed">{hero.subheading}</p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(proj => (
              <Card key={proj._id || proj.slug} className="flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    {proj.isConfidential && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-fg-subtle" />
                        <span>{t('common.confidentialClient')}</span>
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-xl font-bold font-display text-fg">{proj.title}</h2>
                  <p className="text-sm text-fg-muted leading-relaxed line-clamp-3">
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
        ) : (
          <div className="text-center py-16 text-fg-muted border border-dashed border-border rounded-xl">
            <p>{t('common.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
