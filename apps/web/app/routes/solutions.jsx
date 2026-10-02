import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultPages, defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Cpu, ArrowRight } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  let solutions = [];

  try {
    const pageRes = await apiClient(`/pages/solutions-index?locale=${locale}`);
    pageData = pageRes.data?.resolved || pageRes.data;
  } catch {
    pageData = defaultPages['solutions-index'];
  }

  try {
    const solRes = await apiClient(`/solutions?limit=20&locale=${locale}`);
    solutions = solRes.data || [];
  } catch {
    solutions = defaultCatalog.solutions.map(s => localize(s, locale));
  }

  return {
    pageData: localize(pageData, locale),
    solutions,
    locale,
  };
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  return [
    {
      title: isEn
        ? 'Enterprise Software Solutions — Dev House Software'
        : 'Giải pháp Phần mềm Doanh nghiệp — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'Pre-architected, specialized software packages tailored to reduce time-to-market and operational risk.'
        : 'Các gói giải pháp phần mềm chuyên sâu được thiết kế sẵn nhằm rút ngắn thời gian triển khai và tối ưu chi phí.',
    },
  ];
}

export default function SolutionsPage() {
  const { pageData, solutions, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero || defaultPages['solutions-index'].defaults.hero;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="accent">{t('header.nav.solutions')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight">
            {hero.heading}
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed">{hero.subheading}</p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map(sol => (
            <Card key={sol._id || sol.slug} className="p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-fg mb-2">
                    {sol.name || sol.title}
                  </h2>
                  <p className="text-base text-fg-muted leading-relaxed">
                    {sol.summary || sol.description}
                  </p>
                </div>
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
    </div>
  );
}
