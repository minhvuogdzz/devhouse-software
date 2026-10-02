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
      vi: 'Dịch vụ Kỹ thuật Toàn diện',
      en: 'Comprehensive Engineering Services',
    },
    heading: {
      vi: 'Dịch vụ phát triển phần mềm chuyên nghiệp cho mọi giai đoạn phát triển',
      en: 'Professional software engineering tailored to your operational needs',
    },
    subheading: {
      vi: 'Từ phát triển ứng dụng web, di động đến tích hợp AI và kiến trúc đám mây, chúng tôi đồng hành hiện thực hóa ý tưởng của bạn.',
      en: 'From web applications and mobile engineering to cloud infrastructure and AI workflows, we deliver reliable solutions.',
    },
  },
});

export const servicesIndexPage = {
  key: 'services-index',
  title: { vi: 'Dịch vụ', en: 'Services' },
  sections: [servicesHero],
  seo: {
    title: {
      vi: 'Dịch vụ Kỹ thuật Phần mềm — Dev House Software',
      en: 'Software Engineering Services — Dev House Software',
    },
    description: {
      vi: 'Danh mục dịch vụ phát triển phần mềm theo yêu cầu, ứng dụng di động, kiến trúc đám mây và tự động hóa AI.',
      en: 'Comprehensive custom software engineering, mobile app development, cloud infrastructure, and AI automation.',
    },
  },
};
