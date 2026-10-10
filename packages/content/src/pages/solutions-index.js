import { makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

export const solutionsHero = defineSection({
  key: 'hero',
  label: 'Hero Giải pháp',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Giải pháp phần mềm',
      en: 'Software Solutions',
    },
    heading: {
      vi: 'Phần mềm quản lý toàn diện giúp doanh nghiệp phát triển',
      en: 'Complete software solutions that help your business grow',
    },
    subheading: {
      vi: 'Kết hợp các công cụ quản lý thành một hệ thống thống nhất, giúp bạn vận hành doanh nghiệp trơn tru và dễ dàng hơn.',
      en: 'Combined tools for management and operations in one system, helping you run your business smoothly.',
    },
  },
});

export const solutionsList = defineSection({
  key: 'list',
  label: 'Danh sách giải pháp (cách hiển thị)',
  fields: { display: field.display() },
  defaults: {
    display: makeDisplay({
      layout: 'slide',
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      slide: { motion: 'smooth', interval: 6, dots: 'none' },
    }),
  },
});

export const solutionsIndexPage = {
  key: 'solutions-index',
  title: { vi: 'Giải pháp', en: 'Solutions' },
  sections: [solutionsHero, solutionsList],
  seo: {
    title: {
      vi: 'Giải pháp & Phần mềm doanh nghiệp — Devhouse Software',
      en: 'Business Software & Solutions — Devhouse Software',
    },
    description: {
      vi: 'Các giải pháp phần mềm quản lý, bán hàng và hệ thống tự động hóa cho doanh nghiệp.',
      en: 'Business management software, sales tools, and simple automation platforms for growing teams.',
    },
  },
};
