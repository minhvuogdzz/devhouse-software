import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultPages, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Shield, Target, Award, ArrowRight, Users, Compass } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  try {
    const res = await apiClient(`/pages/about?locale=${locale}`);
    pageData = res.data?.resolved || res.data;
  } catch {
    pageData = defaultPages['about'] || {};
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
        ? 'About Dev House Software — Enterprise Engineering & Consulting'
        : 'Giới thiệu về Dev House Software — Đội ngũ Kỹ sư Công nghệ Chuyên nghiệp',
    },
    {
      name: 'description',
      content: isEn
        ? 'Learn about our mission, culture, and track record in delivering high-assurance software systems.'
        : 'Tìm hiểu về văn hóa, sứ mệnh và năng lực triển khai các dự án phần mềm quy mô lớn của Dev House Software.',
    },
  ];
}

export default function AboutPage() {
  const { pageData, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero ||
    defaultPages['about']?.defaults?.hero || {
      heading:
        locale === 'en'
          ? 'We build dependable software that fuels long-term enterprise growth'
          : 'Chúng tôi xây dựng phần mềm phục vụ sự phát triển bền vững của doanh nghiệp',
      subheading:
        locale === 'en'
          ? 'Dev House Software unites dedicated engineers with a deep understanding of business strategy to craft resilient, high-impact digital systems.'
          : 'Dev House Software tập hợp những kỹ sư tâm huyết, am hiểu sâu sắc bài toán kinh doanh thực tế để tạo ra những giải pháp công nghệ chuẩn mực và hiệu quả.',
    };

  const mission = pageData.sections?.mission ||
    defaultPages['about']?.defaults?.mission || {
      heading:
        locale === 'en'
          ? 'The core values that guide every collaboration'
          : 'Những nguyên tắc định hình văn hóa hợp tác của chúng tôi',
      values: [
        {
          title: locale === 'en' ? 'Integrity & Transparency' : 'Trung thực & Minh bạch',
          description:
            locale === 'en'
              ? 'Uncompromised candor regarding project timelines, potential risks, and optimal solutions.'
              : 'Luôn báo cáo thực chất, thẳng thắn về tiến độ, rủi ro và các phương án xử lý tối ưu nhất cho khách hàng.',
        },
        {
          title: locale === 'en' ? 'Engineering Rigor' : 'Chất lượng Kỹ thuật Chuẩn mực',
          description:
            locale === 'en'
              ? 'No shortcuts in testing or architecture; prioritizing resilience, security, and clean maintenance.'
              : 'Không cắt ngắn quy trình kiểm thử và kiến trúc; chú trọng tính ổn định, bảo mật và khả năng bảo trì dài hạn.',
        },
        {
          title: locale === 'en' ? 'Outcome-Driven Value' : 'Tập trung vào Giá trị Thực tế',
          description:
            locale === 'en'
              ? 'Software succeeds only when it creates measurable business velocity and operational efficiency.'
              : 'Phần mềm chỉ có ý nghĩa khi đem lại lợi ích vận hành rõ ràng và tạo đột phá hiệu suất cho tổ chức.',
        },
      ],
    };

  const valueIcons = [Shield, Target, Award];

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero */}
        <div className="max-w-3xl space-y-6">
          <Badge variant="default">{t('header.nav.about')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
            {hero.heading}
          </h1>
          <p className="text-lg sm:text-xl text-fg-muted leading-relaxed">{hero.subheading}</p>
        </div>

        {/* Core Values */}
        <div className="space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
              {mission.heading}
            </h2>
            <p className="text-sm text-fg-muted">
              {locale === 'en'
                ? 'These foundational tenets govern how we design systems and partner with organizations.'
                : 'Các nguyên tắc nền tảng định hướng cách chúng tôi kiến tạo phần mềm và đồng hành cùng khách hàng.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mission.values?.map((val, idx) => {
              const Icon = valueIcons[idx % valueIcons.length];
              return (
                <Card key={idx} className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold font-display text-fg">{val.title}</h3>
                  <p className="text-sm text-fg-muted leading-relaxed">{val.description}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* How We Operate / Partnership Culture */}
        <div className="rounded-2xl bg-surface-raised border border-border p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <Badge variant="secondary">
              {locale === 'en' ? 'Our Working Culture' : 'Văn hóa Làm việc'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
              {locale === 'en'
                ? 'Engineers as strategic partners, not passive executors'
                : 'Đội ngũ kỹ sư là đối tác đồng hành, không chỉ là người thực thi'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-fg-muted">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Compass className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-fg">
                  {locale === 'en' ? 'Deep Domain Understanding' : 'Thấu hiểu Bài toán Nghiệp vụ'}
                </h3>
                <p className="leading-relaxed">
                  {locale === 'en'
                    ? 'We immerse ourselves in your operating context before proposing architectural solutions, ensuring software solves the root problems.'
                    : 'Chúng tôi đào sâu vào quy trình vận hành thực tế của đối tác trước khi bắt tay thiết kế kỹ thuật, đảm bảo phần mềm giải quyết đúng gốc rễ vấn đề.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-fg">
                  {locale === 'en'
                    ? 'Direct Engineer Communication'
                    : 'Giao tiếp Kỹ thuật Trực tiếp'}
                </h3>
                <p className="leading-relaxed">
                  {locale === 'en'
                    ? 'Your stakeholders converse directly with senior architects and developers, eliminating noise and message distortion.'
                    : 'Khách hàng làm việc trực tiếp cùng các kỹ sư phụ trách chính, loại bỏ các tầng trung gian làm sai lệch yêu cầu.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-primary text-primary-fg p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-primary-fg">
              {locale === 'en'
                ? 'Looking for a dedicated software engineering team?'
                : 'Tìm kiếm đối tác công nghệ đáng tin cậy cho dự án?'}
            </h2>
            <p className="text-primary-fg/90 text-sm sm:text-base">
              {locale === 'en'
                ? 'Let us explore how our technical discipline can support your business trajectory.'
                : 'Hãy cùng Dev House bàn luận về mục tiêu chuyển đổi số và lộ trình công nghệ của doanh nghiệp bạn.'}
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
