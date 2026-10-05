import { defineSection, field } from '../define.js';

export const contactHero = defineSection({
  key: 'hero',
  label: 'Hero Liên hệ',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Liên hệ tư vấn',
      en: 'Talk to us',
    },
    heading: {
      vi: 'Cho chúng tôi biết bạn cần gì',
      en: 'Tell us what you need',
    },
    subheading: {
      vi: 'Chia sẻ ngắn gọn về cửa hàng hoặc doanh nghiệp của bạn. Chúng tôi sẽ gợi ý gói dịch vụ phù hợp.',
      en: 'Tell us briefly about your shop or business. We will suggest the package that fits.',
    },
  },
});

export const contactPage = {
  key: 'contact',
  title: { vi: 'Liên hệ', en: 'Contact' },
  sections: [contactHero],
  seo: {
    title: {
      vi: 'Liên hệ tư vấn — Dev House Software',
      en: 'Talk to us — Dev House Software',
    },
    description: {
      vi: 'Cho Dev House Software biết nhu cầu website của bạn để được gợi ý gói dịch vụ phù hợp.',
      en: 'Tell Dev House Software what kind of website you need and get a suggestion for the right package.',
    },
  },
};
