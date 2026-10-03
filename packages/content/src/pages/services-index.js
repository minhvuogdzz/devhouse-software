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
    eyebrow: {
      vi: 'Dịch vụ phần mềm toàn diện',
      en: 'Complete Software Services',
    },
    heading: {
      vi: 'Giải pháp phần mềm đáp ứng đúng nhu cầu kinh doanh của bạn',
      en: 'Professional software tools tailored to your business needs',
    },
    subheading: {
      vi: 'Từ việc thiết kế ứng dụng web, di động đến tích hợp tự động hoá, chúng tôi giúp doanh nghiệp vận hành hiệu quả hơn.',
      en: 'From web and mobile applications to smart workflow automation, we build solutions that help you operate more efficiently.',
    },
  },
});

export const servicesIndexPage = {
  key: 'services-index',
  title: { vi: 'Dịch vụ', en: 'Services' },
  sections: [servicesHero],
  seo: {
    title: {
      vi: 'Dịch vụ phần mềm — Dev House Software',
      en: 'Software Services — Dev House Software',
    },
    description: {
      vi: 'Các dịch vụ phát triển phần mềm tùy chỉnh, thiết kế ứng dụng di động và giải pháp tự động hoá doanh nghiệp.',
      en: 'Custom software development, mobile applications, and reliable business automation solutions.',
    },
  },
};
