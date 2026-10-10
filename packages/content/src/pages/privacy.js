import { defineSection, field } from '../define.js';

export const privacyHero = defineSection({
  key: 'hero',
  label: 'Tiêu đề Chính sách Bảo mật',
  fields: {
    heading: field.text({ max: 120, required: true }),
    lastUpdated: field.text({ max: 60 }),
    content: field.textarea({ max: 5000 }),
  },
  defaults: {
    heading: {
      vi: 'Chính sách Bảo mật Thông tin',
      en: 'Privacy Policy',
    },
    lastUpdated: {
      vi: 'Cập nhật lần cuối: Tháng 10, 2026',
      en: 'Last updated: October 2026',
    },
    content: {
      vi: 'Devhouse Software luôn tôn trọng và bảo vệ thông tin của bạn. Chúng tôi chỉ lưu lại thông tin để trao đổi công việc, tư vấn và cam kết không chia sẻ cho bên thứ ba.',
      en: 'We respect your privacy. Any information you give us is only used to talk about your project and will never be shared with anyone else.',
    },
  },
});

export const privacyPage = {
  key: 'privacy',
  title: { vi: 'Chính sách Bảo mật', en: 'Privacy Policy' },
  sections: [privacyHero],
  seo: {
    title: {
      vi: 'Chính sách Bảo mật Thông tin — Devhouse Software',
      en: 'Privacy Policy — Devhouse Software',
    },
    description: {
      vi: 'Quy định và cam kết bảo vệ dữ liệu, quyền riêng tư của khách hàng tại Devhouse Software.',
      en: 'Read our commitments and guidelines on safeguarding your personal and business data.',
    },
  },
};
