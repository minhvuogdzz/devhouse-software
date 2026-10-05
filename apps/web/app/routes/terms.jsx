import React from 'react';
import { useLoaderData } from 'react-router';
import { loadPage, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { FileText } from 'lucide-react';

export async function loader({ request }) {
  return loadPage('terms', request);
}

export function meta({ data }) {
  return generateSeoMeta({
    title: data?.seo?.title || 'Dev House Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
  });
}

/*
 * DRAFT TEXT: the clauses are plain-language wording based on the company direction document.
 * The company must review them before they are treated as final (see docs/tasks/DECISIONS.md).
 * They are edited in Admin → Pages → Terms of service.
 */
export default function TermsPage() {
  const { sections, locale } = useLoaderData();
  const t = getTranslation(locale);
  const { hero, clauses } = sections;
  const items = clauses?.items || [];

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {isShown(hero) && (
          <div className="space-y-4">
            <Badge variant="default" className="flex items-center gap-1.5 w-fit">
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t('terms.badge')}</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-fg tracking-tight">
              {hero.heading}
            </h1>
            {hero.lastUpdated && <p className="text-sm text-fg-subtle">{hero.lastUpdated}</p>}
          </div>
        )}

        <Card hover={false} className="p-6 sm:p-10 space-y-6 leading-relaxed text-fg-muted">
          {isShown(hero) && hero.content && (
            <p className="text-base sm:text-lg text-fg font-medium">{hero.content}</p>
          )}

          {isShown(clauses) &&
            items.map((clause, index) => (
              <section key={index} className="space-y-3 border-t border-border pt-6 text-sm">
                <h2 className="text-base font-bold font-display text-fg">{clause.title}</h2>
                <p className="whitespace-pre-line">{clause.body}</p>
              </section>
            ))}
        </Card>
      </div>
    </div>
  );
}
