import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Button } from '../components/ui/Button.jsx';
import { ChevronRight, Cpu, CheckCircle2 } from 'lucide-react';

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';
  const slug = params.slug;

  let solution = null;

  try {
    const res = await apiClient(`/solutions/${slug}?locale=${locale}`);
    solution = res.data;
  } catch {
    const fallback = defaultCatalog.solutions.find(
      s => s.slug?.vi === slug || s.slug?.en === slug || s.slug === slug,
    );
    if (fallback) {
      solution = localize(fallback, locale);
    }
  }

  if (!solution) {
    throw new Response('Solution Not Found', { status: 404 });
  }

  return { solution, locale };
}

export function meta({ data }) {
  if (!data?.solution) return [{ title: 'Solution Not Found — Dev House' }];
  const s = data.solution;
  return [
    { title: `${s.name || s.title} — Dev House Software` },
    { name: 'description', content: s.summary || s.description || '' },
  ];
}

export default function SolutionDetailPage() {
  const { solution, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  return (
    <div className="py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-fg-subtle">
          <Link to={prefix || '/'} className="hover:text-fg">
            {t('header.nav.home')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`${prefix}/solutions`} className="hover:text-fg">
            {t('header.nav.solutions')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-fg font-medium">{solution.name || solution.title}</span>
        </nav>

        {/* Hero header */}
        <div className="space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
            {solution.name || solution.title}
          </h1>
          <p className="text-lg sm:text-xl text-fg-muted leading-relaxed max-w-3xl">
            {solution.summary || solution.description}
          </p>
          <div className="pt-2">
            <Button to={`${prefix}/contact`} size="lg">
              {t('common.contactUs')}
            </Button>
          </div>
        </div>

        {/* Features / Capabilities */}
        {solution.features && solution.features.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg">
              {locale === 'en' ? 'Key Capabilities & Modules' : 'Tính năng & Năng lực Cốt lõi'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solution.features.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base font-semibold text-fg">
                      {typeof item === 'string' ? item : item.title || item.name}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-fg-muted mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Card */}
        <div className="p-8 sm:p-12 rounded-2xl bg-surface border border-border text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
            {locale === 'en'
              ? 'Deploy this solution in your organisation'
              : 'Triển khai giải pháp này cho doanh nghiệp của bạn'}
          </h2>
          <p className="text-base text-fg-muted max-w-xl mx-auto">
            {locale === 'en'
              ? 'Our solution architects will work with you to align technical specifications with your current infrastructure.'
              : 'Đội ngũ chuyên gia kiến trúc sẽ khảo sát và tích hợp giải pháp phù hợp với hạ tầng hiện có.'}
          </p>
          <div className="pt-2">
            <Button to={`${prefix}/contact`} size="lg">
              {t('common.contactUs')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
