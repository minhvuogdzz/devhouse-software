import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultPages, defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Cpu, ArrowRight, ExternalLink, Layers } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  let technologies = [];
  let categories = [];

  try {
    const pageRes = await apiClient(`/pages/technologies-index?locale=${locale}`);
    pageData = pageRes.data?.resolved || pageRes.data;
  } catch {
    pageData = defaultPages['technologies-index'] || {
      defaults: {
        hero: {
          eyebrow: { vi: 'Nền tảng kỹ thuật', en: 'Technology Stack' },
          heading: {
            vi: 'Công nghệ được lựa chọn cho độ tin cậy cao',
            en: 'Technologies chosen for reliability and scale',
          },
          subheading: {
            vi: 'Chúng tôi ưu tiên các công nghệ trưởng thành, có cộng đồng hỗ trợ lớn và khả năng mở rộng bền vững theo thời gian.',
            en: 'We prioritize mature, production-proven tools with strong ecosystems and enduring stability.',
          },
        },
      },
    };
  }

  try {
    const techRes = await apiClient(`/technologies?limit=100&locale=${locale}`);
    technologies = techRes.data || [];
  } catch {
    technologies = defaultCatalog.technologies
      ? defaultCatalog.technologies.map(t => localize(t, locale))
      : [];
  }

  try {
    const catRes = await apiClient(`/categories?type=technology&locale=${locale}`);
    categories = catRes.data || [];
  } catch {
    categories = defaultCatalog.categories
      ? defaultCatalog.categories.filter(c => c.type === 'technology').map(c => localize(c, locale))
      : [];
  }

  return {
    pageData: localize(pageData, locale),
    technologies,
    categories,
    locale,
  };
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  return [
    {
      title: isEn
        ? 'Technology Stack & Engineering Standards — Dev House Software'
        : 'Nền tảng Công nghệ & Tiêu chuẩn Kỹ thuật — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'Discover the mature, reliable technologies and engineering practices we use to build durable business systems.'
        : 'Tìm hiểu các công nghệ và tiêu chuẩn kỹ thuật được Dev House áp dụng để phát triển hệ thống bền vững.',
    },
  ];
}

export default function TechnologiesPage() {
  const { pageData, technologies, categories, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero ||
    pageData.defaults?.hero || {
      heading:
        locale === 'en'
          ? 'Engineered with proven technologies'
          : 'Xây dựng trên nền tảng công nghệ tin cậy',
      subheading:
        locale === 'en'
          ? 'We choose technologies based on long-term maintainability, security, and developer productivity.'
          : 'Chúng tôi lựa chọn công nghệ dựa trên tính bảo trì lâu dài, độ an toàn và hiệu năng vận hành thực tế.',
    };

  // Group technologies by category
  const grouped = {};
  if (categories.length > 0) {
    categories.forEach(cat => {
      const catSlug = typeof cat.slug === 'object' ? cat.slug.en || cat.slug.vi : cat.slug;
      grouped[catSlug] = {
        title: cat.name,
        description: cat.description,
        items: [],
      };
    });
  }

  // Also maintain an 'other' or uncategorized bucket
  grouped.general = {
    title: locale === 'en' ? 'Core Technologies' : 'Công nghệ Nền tảng',
    description:
      locale === 'en'
        ? 'Standard components across our development lifecycle'
        : 'Các công cụ nền tảng trong toàn bộ vòng đời phát triển',
    items: [],
  };

  technologies.forEach(tech => {
    const slug = tech.categorySlug || (tech.category && tech.category.slug) || 'general';
    if (!grouped[slug]) {
      grouped[slug] = {
        title: (tech.category && tech.category.name) || slug,
        description: '',
        items: [],
      };
    }
    grouped[slug].items.push(tech);
  });

  const activeGroups = Object.values(grouped).filter(g => g.items.length > 0);

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="default">{t('header.nav.technologies')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight">
            {hero.heading}
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed">{hero.subheading}</p>
        </div>

        {/* Grouped Technologies */}
        {activeGroups.length > 0 ? (
          <div className="space-y-16">
            {activeGroups.map((group, idx) => (
              <div key={idx} className="space-y-6">
                <div className="border-b border-border pb-4 space-y-1">
                  <h2 className="text-2xl font-bold font-display text-fg flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    {group.title}
                  </h2>
                  {group.description && (
                    <p className="text-sm text-fg-muted">{group.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.items.map(tech => (
                    <Card key={tech._id || tech.slug} className="flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                            <Cpu className="w-5 h-5" />
                          </div>
                          {tech.websiteUrl && (
                            <a
                              href={tech.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-fg-subtle hover:text-primary transition-colors p-1"
                              aria-label={`Official documentation for ${tech.name}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <h3 className="text-lg font-bold font-display text-fg">{tech.name}</h3>
                        <p className="text-sm text-fg-muted leading-relaxed">{tech.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-fg-muted border border-dashed border-border rounded-xl">
            <p>{t('common.noResults')}</p>
          </div>
        )}

        {/* Architectural Principles Box */}
        <div className="rounded-2xl bg-surface-raised border border-border p-8 lg:p-12 space-y-6">
          <h2 className="text-2xl font-bold font-display text-fg">
            {locale === 'en' ? 'Our Engineering Philosophy' : 'Nguyên tắc Lựa chọn Công nghệ'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-fg-muted">
            <div className="space-y-2">
              <h3 className="font-semibold text-fg">
                {locale === 'en' ? 'Stability Over Hype' : 'Tính Ổn định Trên hết'}
              </h3>
              <p className="leading-relaxed">
                {locale === 'en'
                  ? 'We select mature technologies with proven production track records rather than unproven new frameworks.'
                  : 'Chúng tôi ưu tiên những công nghệ đã được chứng minh qua thực tế sản xuất, tránh rủi ro từ các trào lưu chưa ổn định.'}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-fg">
                {locale === 'en' ? 'Maintainable Code' : 'Dễ Bảo trì & Chuyển giao'}
              </h3>
              <p className="leading-relaxed">
                {locale === 'en'
                  ? 'Standard architectures and clean patterns ensure that client internal teams can maintain and extend the codebase.'
                  : 'Kiến trúc chuẩn hóa và rõ ràng giúp đội ngũ kỹ thuật của đối tác dễ dàng tiếp quản và phát triển tiếp sau này.'}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-fg">
                {locale === 'en' ? 'Cost & Performance Efficiency' : 'Tối ưu Chi phí Vận hành'}
              </h3>
              <p className="leading-relaxed">
                {locale === 'en'
                  ? 'Solutions are optimized to minimize cloud server costs and ensure snappy responsiveness for end users.'
                  : 'Hệ thống được thiết kế để tiết kiệm chi phí máy chủ đám mây đồng thời đảm bảo tốc độ phản hồi nhanh chóng.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-primary text-primary-fg p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary-fg">
              {locale === 'en'
                ? 'Need technical advice for your next project?'
                : 'Cần tư vấn kiến trúc công nghệ cho dự án?'}
            </h2>
            <p className="text-primary-fg/90 text-sm sm:text-base">
              {locale === 'en'
                ? 'Our technical leads are ready to evaluate your existing system or new architecture.'
                : 'Đội ngũ chuyên gia kỹ thuật của chúng tôi sẵn sàng đánh giá hiện trạng và đề xuất giải pháp phù hợp.'}
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
