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
    eyebrow: { vi: 'Dự án', en: 'Projects' },
    heading: {
      vi: 'Các dự án website của Dev House',
      en: 'Website projects by Dev House',
    },
    subheading: {
      vi: 'Rê chuột vào dự án để xem thông tin, bấm Xem demo để dùng thử ngay trên trang này.',
      en: 'Hover over a project for its details and press View demo to try it on this page.',
    },
  },
});

export const projectsEmpty = defineSection({
  key: 'empty',
  label: 'Khi chưa có dự án nào',
  fields: { heading: field.text({ max: 120 }), text: field.textarea({ max: 300 }) },
  defaults: {
    heading: { vi: 'Đang cập nhật dự án', en: 'Projects are on the way' },
    text: {
      vi: 'Chúng tôi sẽ sớm đăng các dự án đã thực hiện. Bạn có thể liên hệ để được tư vấn trực tiếp.',
      en: 'We will soon share the projects we have built. Contact us to talk it through directly.',
    },
  },
});

export const projectsCta = defineSection({
  key: 'cta',
  label: 'Kêu gọi hành động',
  fields: {
    heading: field.text({ max: 150 }),
    subheading: field.textarea({ max: 300 }),
    button: field.link(),
  },
  defaults: {
    heading: { vi: 'Muốn có một website như vậy?', en: 'Want a website like these?' },
    subheading: {
      vi: 'Cho chúng tôi biết nhu cầu, chúng tôi sẽ gợi ý gói phù hợp.',
      en: 'Tell us what you need and we will suggest the right package.',
    },
    button: {
      label: { vi: 'Liên hệ tư vấn', en: 'Talk to us' },
      url: '/contact',
      target: '_self',
    },
  },
});

export const projectsIndexPage = {
  key: 'projects-index',
  title: { vi: 'Dự án', en: 'Projects' },
  sections: [projectsHero, projectsEmpty, projectsCta],
  seo: {
    title: {
      vi: 'Dự án — Dev House Software',
      en: 'Projects — Dev House Software',
    },
    description: {
      vi: 'Các dự án website của Dev House Software. Xem thử từng dự án ngay trên trang.',
      en: 'Website projects by Dev House Software. Try each project right on the page.',
    },
  },
};
