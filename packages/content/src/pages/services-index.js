import { makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

export const servicesHero = defineSection({
  key: 'hero',
  label: 'Hero Dịch vụ',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: { vi: 'Dịch vụ', en: 'Services' },
    heading: {
      vi: 'Bốn nhóm dịch vụ giúp website của bạn chạy ổn định',
      en: 'Four services that keep your website running well',
    },
    subheading: {
      vi: 'Chúng tôi lo từ lúc dựng website đến khi web chạy an toàn, có sao lưu và có người xử lý sự cố.',
      en: 'We take care of everything from building the website to keeping it safe, backed up and fixed when something breaks.',
    },
  },
});

export const servicesList = defineSection({
  key: 'list',
  label: 'Danh sách dịch vụ (cách hiển thị)',
  fields: { display: field.display() },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
  },
});

export const servicesCta = defineSection({
  key: 'cta',
  label: 'Kêu gọi hành động',
  fields: {
    heading: field.text({ max: 150 }),
    subheading: field.textarea({ max: 300 }),
    button: field.link(),
  },
  defaults: {
    heading: {
      vi: 'Chưa biết nên chọn gói nào?',
      en: 'Not sure which package to choose?',
    },
    subheading: {
      vi: 'Cho chúng tôi biết nhu cầu của bạn, chúng tôi sẽ gợi ý gói phù hợp.',
      en: 'Tell us what you need and we will recommend the right package.',
    },
    button: {
      label: { vi: 'Liên hệ tư vấn', en: 'Talk to us' },
      url: '/contact',
      target: '_self',
    },
  },
});

export const servicesIndexPage = {
  key: 'services-index',
  title: { vi: 'Dịch vụ', en: 'Services' },
  sections: [servicesHero, servicesList, servicesCta],
  seo: {
    title: {
      vi: 'Dịch vụ — Devhouse Software',
      en: 'Services — Devhouse Software',
    },
    description: {
      vi: 'Thiết kế website, máy chủ đám mây, tên miền và bảo mật trọn gói cho cửa hàng và doanh nghiệp nhỏ.',
      en: 'Website design, cloud hosting, domain and security in one package for shops and small businesses.',
    },
  },
};
