import { defineSection, field } from '../define.js';

export const termsHero = defineSection({
  key: 'hero',
  label: 'Tiêu đề Điều khoản',
  fields: {
    heading: field.text({ max: 120, required: true }),
    lastUpdated: field.text({ max: 60 }),
    content: field.textarea({ max: 5000 }),
  },
  defaults: {
    heading: {
      vi: 'Điều khoản Sử dụng Dịch vụ',
      en: 'Terms of Service',
    },
    lastUpdated: {
      vi: 'Cập nhật lần cuối: Tháng 10, 2026',
      en: 'Last updated: October 2026',
    },
    content: {
      vi: 'Chào mừng quý khách đến với website chính thức của Dev House Software. Việc truy cập và sử dụng dịch vụ của chúng tôi đồng nghĩa với việc bạn đồng ý với các điều khoản pháp lý, bản quyền tác giả và quy định bảo vệ sở hữu trí tuệ đã được ban hành.',
      en: 'Welcome to Dev House Software. By accessing this website or engaging our professional engineering services, you agree to comply with our commercial terms, intellectual property protections, and governing professional standards.',
    },
  },
});

export const termsPage = {
  key: 'terms',
  title: { vi: 'Điều khoản Dịch vụ', en: 'Terms of Service' },
  sections: [termsHero],
  seo: {
    title: {
      vi: 'Điều khoản Dịch vụ — Dev House Software',
      en: 'Terms of Service — Dev House Software',
    },
    description: {
      vi: 'Các điều khoản và điều kiện pháp lý khi truy cập website và sử dụng dịch vụ của Dev House Software.',
      en: 'Review the operational and legal terms governing the use of Dev House Software services.',
    },
  },
};
