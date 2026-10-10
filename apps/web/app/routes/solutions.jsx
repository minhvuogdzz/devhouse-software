import React from 'react';
import { generateSeoMeta } from '../lib/seo.js';
import { useLoaderData, Link } from 'react-router';
import { defaultCatalog, localize } from '@devhouse/content';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ScrollReveal } from '../components/ui/ScrollReveal.jsx';
import { Collection } from '../components/ui/Collection.jsx';
import { Cpu, ArrowRight } from 'lucide-react';

export async function loader({ request }) {
  const page = await loadPage('solutions-index', request);
  const solutions = await loadList(
    `/solutions?limit=20&locale=${page.locale}`,
    defaultCatalog.solutions ? defaultCatalog.solutions.map(s => localize(s, page.locale)) : [],
  );
  return { ...page, solutions };
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  const title = isEn
    ? 'Enterprise Software Solutions — Devhouse Software'
    : 'Giải pháp Phần mềm Doanh nghiệp — Devhouse Software';
  const description = isEn
    ? 'Pre-architected, specialized software packages tailored to reduce time-to-market and operational risk.'
    : 'Các gói giải pháp phần mềm chuyên sâu được thiết kế sẵn nhằm rút ngắn thời gian triển khai và tối ưu chi phí.';

  return generateSeoMeta({
    title,
    description,
    url: data?.url,
    locale: data?.locale,
    type: 'website',
  });
}

export default function SolutionsPage() {
  const { sections, solutions, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';
  const hero = sections?.hero || {
    heading:
      locale === 'en'
        ? 'Enterprise Software & Cloud Engineering Solutions'
        : 'Giải pháp Phần mềm & Kỹ thuật Đám mây',
    subheading:
      locale === 'en'
        ? 'Engineered for reliability, velocity, and business growth.'
        : 'Được tối ưu cho sự ổn định, tốc độ và mở rộng kinh doanh.',
  };

  return (
    <div className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        {isShown(hero) && (
          <ScrollReveal direction="up" className="max-w-3xl space-y-4">
            {hero.eyebrow && <Badge variant="accent">{hero.eyebrow}</Badge>}
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

        {/* Solutions: shown as the admin chose (grid, list or slide) */}
        <Collection
          items={solutions}
          display={sections?.list?.display}
          label={t('header.nav.solutions')}
          getKey={sol => sol._id || sol.slug}
          renderItem={sol => (
            <Card className="p-6 flex h-full flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display text-fg mb-2">
                    {sol.name || sol.title}
                  </h2>
                  <p className="text-sm text-fg-muted leading-relaxed">
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
          )}
        />
      </div>
    </div>
  );
}
