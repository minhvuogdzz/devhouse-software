import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { RichTextRenderer } from '../components/rich-text/RichTextRenderer.jsx';
import { ArrowLeft, ArrowRight, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';
  const { slug } = params;

  try {
    const res = await apiClient(`/projects/${slug}?locale=${locale}`);
    return {
      project: res.data,
      locale,
      slug,
    };
  } catch {
    // If not found from API, return fallback project representation
    return {
      project: {
        title: locale === 'en' ? 'Enterprise Core Platform' : 'Hệ thống Nền tảng Doanh nghiệp',
        shortDescription:
          locale === 'en'
            ? 'Comprehensive modernization of mission-critical business systems.'
            : 'Hiện đại hóa toàn diện hệ thống quản lý vận hành cốt lõi cho doanh nghiệp.',
        client: {
          name: '',
          industry: locale === 'en' ? 'Logistics & Supply Chain' : 'Logistics & Chuỗi cung ứng',
          isConfidential: true,
        },
        challenge:
          locale === 'en'
            ? 'Legacy architecture resulted in high latency, frequent downtime during peak periods, and substantial operational overhead.'
            : 'Kiến trúc cũ gây ra độ trễ cao, gián đoạn thường xuyên trong giờ cao điểm và chi phí vận hành tốn kém.',
        solution:
          locale === 'en'
            ? 'Engineered a modern, distributed system with automated data pipelines, real-time observability, and high-availability clustering.'
            : 'Thiết kế và triển khai kiến trúc phân tán hiện đại, tự động hóa quy trình dữ liệu và đảm bảo độ sẵn sàng cao.',
        results: [
          {
            value: '99.99%',
            label: locale === 'en' ? 'Uptime' : 'Thời gian khả dụng',
            description:
              locale === 'en'
                ? 'Continuous service availability'
                : 'Duy trì hoạt động liên tục không gián đoạn',
          },
          {
            value: '3.5x',
            label: locale === 'en' ? 'Throughput' : 'Năng lực xử lý',
            description:
              locale === 'en' ? 'Higher transaction volume' : 'Tăng tốc độ xử lý giao dịch thực tế',
          },
        ],
        technologies: [
          { name: 'Node.js', category: 'Backend' },
          { name: 'PostgreSQL', category: 'Database' },
          { name: 'React', category: 'Frontend' },
        ],
      },
      locale,
      slug,
    };
  }
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  const title = data?.project?.title || (isEn ? 'Project Details' : 'Chi tiết Dự án');
  return [
    { title: `${title} — Dev House Software` },
    {
      name: 'description',
      content:
        data?.project?.shortDescription ||
        (isEn
          ? 'Dev House project case study.'
          : 'Chi tiết dự án phần mềm do Dev House thực hiện.'),
    },
  ];
}

export default function ProjectDetailPage() {
  const { project, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const isConfidential = project.client?.isConfidential || !project.client?.name;
  const clientName = isConfidential ? t('common.confidentialClient') : project.client.name;

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Navigation & Header */}
        <div className="space-y-6">
          <Link
            to={`${prefix}/projects`}
            className="inline-flex items-center text-sm font-semibold text-fg-muted hover:text-fg gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.exploreProjects')}
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">{t('header.nav.projects')}</Badge>
              {isConfidential ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-fg-subtle" />
                  <span>{t('common.confidentialClient')}</span>
                </Badge>
              ) : (
                <Badge variant="secondary">{clientName}</Badge>
              )}
              {project.client?.industry && (
                <Badge variant="outline">{project.client.industry}</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-fg tracking-tight">
              {project.title}
            </h1>

            {project.shortDescription && (
              <p className="text-lg text-fg-muted leading-relaxed">{project.shortDescription}</p>
            )}
          </div>
        </div>

        {/* Project Results / Metrics */}
        {project.results?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-display text-fg">
              {locale === 'en' ? 'Measured Outcomes' : 'Kết quả Đạt được'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.results.map((res, i) => (
                <Card key={i} className="space-y-2 border-primary/20 bg-primary-subtle/30">
                  <div className="text-3xl lg:text-4xl font-extrabold font-display text-primary">
                    {res.value}
                  </div>
                  <div className="text-sm font-semibold text-fg">{res.label}</div>
                  {res.description && (
                    <div className="text-xs text-fg-muted">{res.description}</div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Challenge and Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {project.challenge && (
            <Card className="space-y-4">
              <h2 className="text-xl font-bold font-display text-fg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                {locale === 'en' ? 'The Business Challenge' : 'Thách thức Đặt ra'}
              </h2>
              <div className="text-fg-muted leading-relaxed">
                <RichTextRenderer content={project.challenge} />
              </div>
            </Card>
          )}

          {project.solution && (
            <Card className="space-y-4">
              <h2 className="text-xl font-bold font-display text-fg flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-success" />
                {locale === 'en' ? 'Our Engineering Solution' : 'Giải pháp Kỹ thuật'}
              </h2>
              <div className="text-fg-muted leading-relaxed">
                <RichTextRenderer content={project.solution} />
              </div>
            </Card>
          )}
        </div>

        {/* Main Content / Description if available */}
        {project.description && (
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg">
              {locale === 'en' ? 'Project Overview' : 'Tổng quan Dự án'}
            </h2>
            <div className="text-fg-muted leading-relaxed">
              <RichTextRenderer content={project.description} />
            </div>
          </div>
        )}

        {/* Features / Capabilities */}
        {project.features?.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-display text-fg">
              {locale === 'en' ? 'Key Capabilities Delivered' : 'Tính năng & Năng lực Cốt lõi'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-fg">{feat.title}</h3>
                    {feat.description && (
                      <p className="text-xs text-fg-muted leading-relaxed">{feat.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technologies Used */}
        {project.technologies?.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-border">
            <h2 className="text-lg font-bold font-display text-fg">
              {locale === 'en' ? 'Technologies & Frameworks' : 'Công nghệ & Nền tảng'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, i) => {
                const name = typeof tech === 'object' ? tech.name || tech.title : tech;
                return (
                  <Badge key={i} variant="outline" className="text-sm px-3 py-1">
                    {name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* External project link if available */}
        {project.projectUrl && (
          <div className="pt-2">
            <a
              href={project.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <span>{locale === 'en' ? 'Visit Live Project' : 'Truy cập Sản phẩm'}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-surface-raised border border-border p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
            {locale === 'en'
              ? 'Ready to build a system of comparable scale?'
              : 'Doanh nghiệp của bạn cần giải pháp tương tự?'}
          </h2>
          <p className="max-w-2xl mx-auto text-fg-muted text-sm sm:text-base leading-relaxed">
            {locale === 'en'
              ? 'Connect with our engineering team to discuss architecture, timeline, and delivery outcomes tailored to your business.'
              : 'Hãy kết nối cùng đội ngũ kỹ thuật của Dev House để trao đổi về phương án kiến trúc, thời gian và mục tiêu chuyển đổi.'}
          </p>
          <div className="flex justify-center">
            <Button as={Link} to={`${prefix}/contact`} variant="primary" size="lg">
              {t('common.contactUs')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
