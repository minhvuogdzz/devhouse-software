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
      vi: 'Dev House Software cam kết bảo mật tuyệt đối các thông tin khách hàng và đối tác cung cấp. Chúng tôi chỉ thu thập các thông tin liên hệ cần thiết phục vụ quá trình trao đổi công việc, tư vấn giải pháp và đảm bảo không chia sẻ cho bên thứ ba vì bất kỳ mục đích thương mại nào.',
      en: 'Dev House Software is strictly committed to protecting the privacy and confidentiality of our clients and partners. Information collected via this website is used solely for project correspondence and technical consultations, and is never disclosed to external parties for commercial gain.',
    },
  },
});

export const privacyPage = {
  key: 'privacy',
  title: { vi: 'Chính sách Bảo mật', en: 'Privacy Policy' },
  sections: [privacyHero],
  seo: {
    title: {
      vi: 'Chính sách Bảo mật Thông tin — Dev House Software',
      en: 'Privacy Policy — Dev House Software',
    },
    description: {
      vi: 'Quy định và cam kết bảo vệ dữ liệu, quyền riêng tư của khách hàng tại Dev House Software.',
      en: 'Read our commitments and guidelines on safeguarding your personal and business data.',
    },
  },
};
