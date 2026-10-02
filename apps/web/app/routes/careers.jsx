import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultPages, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Sparkles, Mail, ArrowRight } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  try {
    const res = await apiClient(`/pages/careers?locale=${locale}`);
    pageData = res.data?.resolved || res.data;
  } catch {
    pageData = defaultPages['careers'] || {};
  }

  return {
    pageData: localize(pageData, locale),
    locale,
  };
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  return [
    {
      title: isEn
        ? 'Careers & Engineering Opportunities — Dev House Software'
        : 'Cơ hội Nghề nghiệp & Gia nhập Đội ngũ — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'Discover software engineering and systems roles at Dev House Software.'
        : 'Khám phá các vị trí kỹ sư phần mềm và kiến trúc sư hệ thống tại Dev House Software.',
    },
  ];
}

export default function CareersPage() {
  const { pageData, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero ||
    defaultPages['careers']?.defaults?.hero || {
      heading:
        locale === 'en'
          ? 'Build impactful technology products with our engineering collective'
          : 'Cùng xây dựng những sản phẩm công nghệ có giá trị thực sự',
      subheading:
        locale === 'en'
          ? 'We are looking for dedicated engineers who thrive on technical challenges and take true pride in their craftsmanship.'
          : 'Chúng tôi tìm kiếm những kỹ sư tài năng, yêu thích giải quyết bài toán phức tạp và đề cao tinh thần trách nhiệm trong công việc.',
    };

  const culture = pageData.sections?.culture ||
    defaultPages['careers']?.defaults?.culture || {
      heading:
        locale === 'en'
          ? 'A collaborative environment designed for sustained professional growth'
          : 'Môi trường làm việc tôn trọng và tạo điều kiện phát triển',
      items: [
        {
          title: locale === 'en' ? 'Continuous Learning' : 'Học hỏi & Nâng tầm Kỹ năng',
          description:
            locale === 'en'
              ? 'Work on demanding enterprise projects with industry-standard practices and a clear growth trajectory.'
              : 'Cơ hội tiếp cận các dự án kỹ thuật thử thách, quy trình chuẩn mực và định hướng thăng tiến rõ ràng.',
        },
        {
          title: locale === 'en' ? 'Autonomy & Flexibility' : 'Tự chủ & Linh hoạt',
          description:
            locale === 'en'
              ? 'Empowered to make architectural decisions and evaluated purely on substantive delivery outcomes.'
              : 'Được trao quyền quyết định giải pháp kỹ thuật, đánh giá dựa trên kết quả bàn giao thực chất.',
        },
        {
          title: locale === 'en' ? 'Competitive Compensation' : 'Đãi ngộ Cạnh tranh',
          description:
            locale === 'en'
              ? 'Competitive remuneration, regular performance reviews, and comprehensive health benefits.'
              : 'Chế độ lương thưởng tương xứng năng lực, xem xét định kỳ và chăm sóc sức khỏe toàn diện.',
        },
      ],
    };

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <Badge variant="default">
            {locale === 'en' ? 'Careers at Dev House' : 'Cơ hội Nghề nghiệp'}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
            {hero.heading}
          </h1>
          <p className="text-lg sm:text-xl text-fg-muted leading-relaxed">{hero.subheading}</p>
        </div>

        {/* Culture / Benefits */}
        <div className="space-y-8">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
              {culture.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {culture.items?.map((item, idx) => (
              <Card key={idx} className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-display text-fg">{item.title}</h3>
                <p className="text-sm text-fg-muted leading-relaxed">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* General Application Callout */}
        <div className="rounded-2xl bg-surface-raised border border-border p-8 sm:p-12 space-y-6">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
              {locale === 'en'
                ? 'Looking for your next engineering milestone?'
                : 'Tìm kiếm bến đỗ kỹ thuật tiếp theo của bạn?'}
            </h2>
            <p className="text-sm sm:text-base text-fg-muted leading-relaxed">
              {locale === 'en'
                ? 'We are always interested in connecting with passionate software engineers, system architects, and technical leads who share our commitment to engineering excellence.'
                : 'Chúng tôi luôn chào đón các kỹ sư phần mềm, kiến trúc sư hệ thống giàu năng lực và tâm huyết gia nhập đội ngũ Dev House.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <Button as="a" href="mailto:careers@devhouse.com.vn" variant="primary" size="lg">
              <Mail className="w-4 h-4 mr-2" />
              {locale === 'en'
                ? 'Send Your CV to careers@devhouse.com.vn'
                : 'Gửi CV về careers@devhouse.com.vn'}
            </Button>
            <Button as={Link} to={`${prefix}/contact`} variant="outline" size="lg">
              {t('common.contactUs')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
