import { defineSection, field } from '../define.js';

export const projectsHero = defineSection({
  key: 'hero',
  label: 'Hero Dự án',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Hồ sơ Năng lực Thực tế',
      en: 'Proven Project Portfolio',
    },
    heading: {
      vi: 'Các dự án công nghệ tiêu biểu cùng đối tác',
      en: 'Selected client initiatives and successful software deliveries',
    },
    subheading: {
      vi: 'Khám phá cách chúng tôi đồng hành cùng khách hàng giải quyết bài toán kỹ thuật và nâng cao hiệu quả vận hành kinh doanh.',
      en: 'Explore how we collaborate with business partners to engineer reliable, scalable software products.',
    },
  },
});

export const projectsIndexPage = {
  key: 'projects-index',
  title: { vi: 'Dự án', en: 'Projects' },
  sections: [projectsHero],
  seo: {
    title: {
      vi: 'Dự án Tiêu biểu — Dev House Software',
      en: 'Case Studies & Projects — Dev House Software',
    },
    description: {
      vi: 'Tổng hợp các dự án phần mềm doanh nghiệp, ứng dụng web và di động đã bàn giao thành công.',
      en: 'Showcase of successfully delivered software systems, web platforms, and mobile products.',
    },
  },
};
