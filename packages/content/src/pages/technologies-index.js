import { makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

export const technologiesHero = defineSection({
  key: 'hero',
  label: 'Hero Công nghệ',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Công nghệ & Nền tảng Ứng dụng',
      en: 'Modern Technology Stack',
    },
    heading: {
      vi: 'Nền tảng kỹ thuật hiện đại, ổn định và bảo mật cao',
      en: 'Battle-tested technologies chosen for performance and reliability',
    },
    subheading: {
      vi: 'Chúng tôi lựa chọn những công nghệ trưởng thành, có cộng đồng phát triển mạnh mẽ và khả năng mở rộng tốt nhất cho doanh nghiệp.',
      en: 'We curate mature, well-supported technologies to ensure long-term stability and effortless maintainability.',
    },
  },
});

export const technologiesList = defineSection({
  key: 'list',
  label: 'Danh sách công nghệ (cách hiển thị)',
  fields: { display: field.display() },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
  },
});

export const technologiesIndexPage = {
  key: 'technologies-index',
  title: { vi: 'Công nghệ', en: 'Technologies' },
  sections: [technologiesHero, technologiesList],
  seo: {
    title: {
      vi: 'Năng lực Công nghệ — Devhouse Software',
      en: 'Technology Stack — Devhouse Software',
    },
    description: {
      vi: 'Danh mục công nghệ lập trình, cơ sở dữ liệu, điện toán đám mây và công cụ được sử dụng tại Devhouse Software.',
      en: 'Explore the modern engineering frameworks, cloud stacks, and databases powering our solutions.',
    },
  },
};
