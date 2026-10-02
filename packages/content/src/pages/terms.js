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
      vi: 'Chào mừng bạn đến với Dev House Software. Khi truy cập trang web hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý với các nguyên tắc và điều khoản làm việc cơ bản để hai bên có thể hợp tác suôn sẻ.',
      en: 'Welcome to Dev House Software. By using our website or working with us, you agree to our clear terms and rules so we can build a smooth partnership.',
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
