import { defineSection, field } from '../define.js';

export const notFoundHero = defineSection({
  key: 'hero',
  label: 'Hero Trang Không Tìm Thấy',
  fields: {
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
    primaryCta: field.link(),
  },
  defaults: {
    heading: {
      vi: 'Trang bạn tìm kiếm hiện không tồn tại',
      en: 'The page you are looking for could not be found',
    },
    subheading: {
      vi: 'Đường dẫn có thể đã thay đổi hoặc không còn khả dụng. Vui lòng quay lại trang chủ hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ.',
      en: 'The requested URL may have moved or is no longer available. Please return to the homepage or reach out for assistance.',
    },
    primaryCta: {
      label: { vi: 'Về trang chủ', en: 'Back to Home' },
      url: '/',
      target: '_self',
    },
  },
});

export const notFoundPage = {
  key: 'not-found',
  title: { vi: 'Không tìm thấy trang (404)', en: 'Page Not Found (404)' },
  sections: [notFoundHero],
  seo: {
    title: {
      vi: '404 — Không tìm thấy trang — Dev House Software',
      en: '404 — Page Not Found — Dev House Software',
    },
    description: {
      vi: 'Trang bạn yêu cầu không tồn tại trên hệ thống.',
      en: 'The requested resource was not found.',
    },
  },
};
