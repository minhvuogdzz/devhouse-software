import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { CheckCircle2, ChevronRight, HelpCircle, Layers } from 'lucide-react';

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';
  const slug = params.slug;

  let service = null;

  try {
    const res = await apiClient(`/services/${slug}?locale=${locale}`);
    service = res.data;
  } catch {
    const fallback = defaultCatalog.services.find(
      s => s.slug?.vi === slug || s.slug?.en === slug || s.slug === slug,
    );
    if (fallback) {
      service = localize(fallback, locale);
    }
  }

  if (!service) {
    throw new Response('Service Not Found', { status: 404 });
  }

  return {
    service,
    locale,
  };
}

export function meta({ data }) {
  if (!data?.service) return [{ title: 'Service Not Found — Dev House' }];
  const s = data.service;
  return [
    { title: `${s.name || s.title} — Dev House Software` },
    { name: 'description', content: s.summary || s.description || '' },
  ];
}

export default function ServiceDetailPage() {
  const { service, locale } = useLoaderData();
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
          <Link to={`${prefix}/services`} className="hover:text-fg">
            {t('header.nav.services')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-fg font-medium">{service.name || service.title}</span>
        </nav>

        {/* Hero header */}
        <div className="space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-primary-subtle text-primary flex items-center justify-center">
            <Layers className="w-7 h-7" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
            {service.name || service.title}
          </h1>
          <p className="text-lg sm:text-xl text-fg-muted leading-relaxed max-w-3xl">
            {service.summary || service.description}
          </p>
          <div className="pt-2">
            <Button to={`${prefix}/contact`} size="lg">
              {t('common.contactUs')}
            </Button>
          </div>
        </div>

        {/* Key Deliverables / Features */}
        {service.deliverables && service.deliverables.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg">
              {locale === 'en' ? 'What You Receive (Deliverables)' : 'Kết quả Bàn giao Cụ thể'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
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

        {/* FAQs if present */}
        {service.faqs && service.faqs.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              <span>{locale === 'en' ? 'Frequently Asked Questions' : 'Câu hỏi Thường gặp'}</span>
            </h2>
            <div className="space-y-4">
              {service.faqs.map((faq, idx) => (
                <Card key={idx} className="p-6">
                  <h3 className="text-lg font-bold font-display text-fg mb-2">{faq.question}</h3>
                  <p className="text-sm text-fg-muted leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="p-8 sm:p-12 rounded-2xl bg-surface-2 border border-border text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
            {locale === 'en'
              ? 'Ready to move your initiative forward?'
              : 'Sẵn sàng khởi động giải pháp cho doanh nghiệp?'}
          </h2>
          <p className="text-base text-fg-muted max-w-xl mx-auto">
            {locale === 'en'
              ? 'Book a direct conversation with our engineering team to assess technical feasibility and timeline.'
              : 'Liên hệ trực tiếp với chúng tôi để nhận lộ trình phát triển và đánh giá khả thi chuyên sâu.'}
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
