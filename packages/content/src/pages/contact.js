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
      vi: 'Kết nối cùng Đội ngũ Chuyên gia',
      en: 'Connect with Our Team',
    },
    heading: {
      vi: 'Thảo luận về bài toán và lộ trình công nghệ của doanh nghiệp bạn',
      en: 'Let’s discuss your upcoming software goals and challenges',
    },
    subheading: {
      vi: 'Chúng tôi sẵn sàng lắng nghe, tư vấn phương án kỹ thuật phù hợp và hỗ trợ bạn dự toán chi phí triển khai tối ưu.',
      en: 'Share your business context or project scope with us. We will respond promptly within one working day.',
    },
  },
});

export const contactPage = {
  key: 'contact',
  title: { vi: 'Liên hệ', en: 'Contact' },
  sections: [contactHero],
  seo: {
    title: {
      vi: 'Liên hệ Tư vấn Phần mềm — Dev House Software',
      en: 'Contact Us — Dev House Software',
    },
    description: {
      vi: 'Liên hệ với Dev House Software để nhận tư vấn kỹ thuật chuyên sâu và dự toán kinh phí cho dự án phần mềm của bạn.',
      en: 'Get in touch with Dev House Software for dedicated software consulting and project estimates.',
    },
  },
};
