import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { RichTextRenderer } from '../components/rich-text/RichTextRenderer.jsx';
import { ArrowLeft, Clock, Calendar, User, ArrowRight } from 'lucide-react';

export async function loader({ params, request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';
  const { slug } = params;

  try {
    const res = await apiClient(`/blog/posts/${slug}?locale=${locale}`);
    return {
      post: res.data,
      locale,
      slug,
    };
  } catch {
    // Return sample/fallback post if API is unseeded or during preview
    return {
      post: {
        title:
          locale === 'en'
            ? 'Engineering Principles for Sustainable Software Systems'
            : 'Các Nguyên tắc Kiến trúc Phần mềm Hướng tới Sự Bền vững',
        excerpt:
          locale === 'en'
            ? 'How we approach maintainability, system boundaries, and technology selection for enterprise platforms.'
            : 'Phương pháp tiếp cận tính bảo trì, phân định ranh giới hệ thống và lựa chọn công nghệ cho doanh nghiệp.',
        content:
          locale === 'en'
            ? 'Software architecture is not merely about writing code that works today; it is about ensuring that the system can adapt to business growth over the next five to ten years without requiring continuous rewrites.\n\n### 1. Clear System Boundaries\nEvery module must have a single clear responsibility. Interfaces between components should be well-defined contracts that do not leak internal database schemas or implementation details.\n\n### 2. Pragmatic Technology Choices\nChoose tools based on real operational needs, team familiarity, and proven production stability rather than hype. Simplicity in production always beats unnecessary complexity.'
            : 'Kiến trúc phần mềm không chỉ đơn thuần là việc viết mã nguồn để chạy được hôm nay, mà là đảm bảo hệ thống có thể thích ứng với sự phát triển của doanh nghiệp trong 5 đến 10 năm tới mà không cần đập đi xây lại liên tục.\n\n### 1. Phân định ranh giới hệ thống rõ ràng\nMỗi phân hệ cần có một trách nhiệm duy nhất. Các giao diện kết nối giữa các thành phần phải là các hợp đồng dữ liệu chuẩn xác, không làm lộ chi tiết lưu trữ hay logic nội bộ.\n\n### 2. Lựa chọn công nghệ thực tế\nƯu tiên những công cụ phù hợp với quy mô thực tế của doanh nghiệp, khả năng vận hành và độ ổn định đã được kiểm chứng. Sự đơn giản trong vận hành luôn mang lại giá trị bền vững hơn sự phức tạp không cần thiết.',
        readingTimeMinutes: 4,
        publishedAt: new Date().toISOString(),
        author: {
          name: 'Dev House Engineering Team',
          role: locale === 'en' ? 'Core Architecture Group' : 'Ban Kiến trúc Hệ thống',
          bio:
            locale === 'en'
              ? 'Practicing engineers with extensive experience building mission-critical enterprise systems.'
              : 'Đội ngũ kỹ sư giàu kinh nghiệm thực chiến trong việc thiết kế và xây dựng các hệ thống phần mềm doanh nghiệp.',
        },
        tags: [
          { name: locale === 'en' ? 'Architecture' : 'Kiến trúc', slug: 'architecture' },
          { name: locale === 'en' ? 'Best Practices' : 'Thực tiễn tốt', slug: 'best-practices' },
        ],
      },
      locale,
      slug,
    };
  }
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  const post = data?.post;
  const title = post?.title || (isEn ? 'Insights' : 'Góc nhìn Công nghệ');
  return [
    { title: `${title} — Dev House Software` },
    {
      name: 'description',
      content:
        post?.excerpt ||
        (isEn ? 'Engineering insights from Dev House.' : 'Bài viết chia sẻ kỹ thuật từ Dev House.'),
    },
  ];
}

export default function BlogPostPage() {
  const { post, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const formatDate = isoString => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="py-12 lg:py-20">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Navigation & Breadcrumb */}
        <div>
          <Link
            to={`${prefix}/blog`}
            className="inline-flex items-center text-sm font-semibold text-fg-muted hover:text-fg gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('header.nav.blog')}
          </Link>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {post.tags?.map((tag, idx) => (
              <Badge key={idx} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pt-2 pb-6 border-b border-border text-sm text-fg-muted">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-fg block">
                  {post.author?.name || 'Dev House'}
                </span>
                {post.author?.role && (
                  <span className="text-xs text-fg-subtle">{post.author.role}</span>
                )}
              </div>
            </div>

            {post.publishedAt && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-4 h-4 text-fg-subtle" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
            )}

            {post.readingTimeMinutes && (
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4 text-fg-subtle" />
                <span>
                  {post.readingTimeMinutes} {t('common.readTime')}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Article Body */}
        <div className="pt-2">
          <RichTextRenderer content={post.content} />
        </div>

        {/* Author Bio Box */}
        {post.author?.bio && (
          <div className="p-6 sm:p-8 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0">
              <User className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold font-display text-fg text-base">{post.author.name}</h3>
              {post.author.role && (
                <p className="text-xs text-primary font-medium">{post.author.role}</p>
              )}
              <p className="text-sm text-fg-muted leading-relaxed pt-1">{post.author.bio}</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl bg-primary text-primary-fg p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-display text-primary-fg">
              {locale === 'en'
                ? 'Building mission-critical software?'
                : 'Đang triển khai hệ thống phần mềm cốt lõi?'}
            </h3>
            <p className="text-sm text-primary-fg/90">
              {locale === 'en'
                ? 'Schedule a technical exploration session with our engineers.'
                : 'Trao đổi phương án kiến trúc và lộ trình triển khai cùng đội ngũ chuyên gia của chúng tôi.'}
            </p>
          </div>
          <Button as={Link} to={`${prefix}/contact`} variant="secondary" className="shrink-0">
            {t('common.contactUs')}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </article>
    </div>
  );
}
