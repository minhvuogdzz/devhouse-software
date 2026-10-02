import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultPages, defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  let services = [];

  try {
    const pageRes = await apiClient(`/pages/services-index?locale=${locale}`);
    pageData = pageRes.data?.resolved || pageRes.data;
  } catch {
    pageData = defaultPages['services-index'];
  }

  try {
    const sRes = await apiClient(`/services?limit=20&locale=${locale}`);
    services = sRes.data || [];
  } catch {
    services = defaultCatalog.services.map(s => localize(s, locale));
  }

  return {
    pageData: localize(pageData, locale),
    services,
    locale,
  };
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  return [
    {
      title: isEn
        ? 'Software Development & Architecture Services — Dev House Software'
        : 'Dịch vụ Kỹ thuật & Phát triển Phần mềm — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'End-to-end software development services from system architecture to cloud modernization and maintenance.'
        : 'Cung cấp dịch vụ phát triển phần mềm toàn diện từ kiến trúc hệ thống đến hiện đại hóa hạ tầng đám mây.',
    },
  ];
}

export default function ServicesPage() {
  const { pageData, services, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero || defaultPages['services-index'].defaults.hero;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Banner */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="default">{t('header.nav.services')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight">
            {hero.heading}
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed">{hero.subheading}</p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map(service => (
            <Card key={service._id || service.slug} className="flex flex-col justify-between">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-fg mb-2">
                    {service.name || service.title}
                  </h2>
                  <p className="text-sm text-fg-muted leading-relaxed line-clamp-3">
                    {service.summary || service.description}
                  </p>
                </div>

                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {service.deliverables.slice(0, 3).map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-fg-muted">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{typeof d === 'string' ? d : d.title || d.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-border-subtle">
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

        {/* Contact Banner */}
        <div className="rounded-2xl border border-border bg-surface p-8 sm:p-12 text-center space-y-4">
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-fg">
            {locale === 'en'
              ? 'Need a tailored engineering plan?'
              : 'Cần kế hoạch kỹ thuật riêng cho doanh nghiệp?'}
          </h3>
          <p className="text-base text-fg-muted max-w-xl mx-auto">
            {locale === 'en'
              ? 'Connect with our engineering leads to discuss your scope and architecture requirements.'
              : 'Trao đổi cùng đội ngũ kỹ sư trưởng của chúng tôi để xác định phạm vi và kiến trúc giải pháp.'}
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
