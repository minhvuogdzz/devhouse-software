import { makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

export const blogHero = defineSection({
  key: 'hero',
  label: 'Hero Blog',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Kinh nghiệm thực tiễn',
      en: 'Articles & Insights',
    },
    heading: {
      vi: 'Kinh nghiệm thực tế về phần mềm, vận hành và quản lý số',
      en: 'Practical advice on software tools, operations, and technical strategy',
    },
    subheading: {
      vi: 'Các bài viết chia sẻ từ đội ngũ Devhouse về kinh nghiệm triển khai phần mềm giúp doanh nghiệp tối ưu chi phí và quy trình.',
      en: 'Read articles from our team on building better tools and planning a clear digital strategy for your business.',
    },
  },
});

export const blogList = defineSection({
  key: 'list',
  label: 'Danh sách bài viết (cách hiển thị)',
  fields: { display: field.display() },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
  },
});

export const blogIndexPage = {
  key: 'blog-index',
  title: { vi: 'Bài viết', en: 'Blog' },
  sections: [blogHero, blogList],
  seo: {
    title: {
      vi: 'Bài viết & Chia sẻ kinh nghiệm — Devhouse Software',
      en: 'Articles & Insights — Devhouse Software',
    },
    description: {
      vi: 'Khám phá các bài viết chia sẻ kinh nghiệm phát triển phần mềm và tối ưu hóa hệ thống vận hành cho doanh nghiệp.',
      en: 'Discover practical insights on choosing the right software and optimizing your business operations.',
    },
  },
};
