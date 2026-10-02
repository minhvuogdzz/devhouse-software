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
      vi: 'Góc nhìn & Chia sẻ Kỹ thuật',
      en: 'Engineering Insights & Articles',
    },
    heading: {
      vi: 'Kiến thức kỹ thuật, chuyển đổi số và kinh nghiệm xây dựng sản phẩm',
      en: 'Perspectives on software craftsmanship, architecture, and technology leadership',
    },
    subheading: {
      vi: 'Tổng hợp các bài viết chuyên sâu từ đội ngũ kỹ sư Dev House Software về tối ưu vận hành và giải pháp thực tế.',
      en: 'In-depth articles from our engineering team on software design, scaling, and digital strategy.',
    },
  },
});

export const blogIndexPage = {
  key: 'blog-index',
  title: { vi: 'Bài viết', en: 'Blog' },
  sections: [blogHero],
  seo: {
    title: {
      vi: 'Bài viết & Kiến thức Kỹ thuật — Dev House Software',
      en: 'Articles & Insights — Dev House Software',
    },
    description: {
      vi: 'Khám phá các bài viết chia sẻ kinh nghiệm phát triển phần mềm, kiến trúc hệ thống và chuyển đổi số cho doanh nghiệp.',
      en: 'Discover practical insights on enterprise architecture, software engineering practices, and digital strategy.',
    },
  },
};
