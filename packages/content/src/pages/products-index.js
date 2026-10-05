import { defineSection, field } from '../define.js';

export const productsHero = defineSection({
  key: 'hero',
  label: 'Hero Mẫu website',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: { vi: 'Mẫu website', en: 'Templates' },
    heading: {
      vi: 'Chọn mẫu bạn thích, xem thử ngay',
      en: 'Pick a template you like and try it right away',
    },
    subheading: {
      vi: 'Rê chuột vào mẫu để xem thông tin, bấm Xem demo để dùng thử ngay trên trang này.',
      en: 'Hover over a template for its details and press View demo to try it on this page.',
    },
  },
});

export const productsEmpty = defineSection({
  key: 'empty',
  label: 'Khi chưa có mẫu nào',
  fields: { heading: field.text({ max: 120 }), text: field.textarea({ max: 300 }) },
  defaults: {
    heading: { vi: 'Đang cập nhật mẫu mới', en: 'New templates are on the way' },
    text: {
      vi: 'Chúng tôi đang chuẩn bị thêm mẫu. Bạn có thể liên hệ để được tư vấn mẫu phù hợp.',
      en: 'We are preparing more templates. Contact us and we will help you find the right one.',
    },
  },
});

export const productsCta = defineSection({
  key: 'cta',
  label: 'Kêu gọi hành động',
  fields: {
    heading: field.text({ max: 150 }),
    subheading: field.textarea({ max: 300 }),
    button: field.link(),
  },
  defaults: {
    heading: { vi: 'Không thấy mẫu ưng ý?', en: 'Cannot find the one you want?' },
    subheading: {
      vi: 'Hãy mô tả điều bạn cần, chúng tôi sẽ gợi ý mẫu hoặc làm theo yêu cầu.',
      en: 'Describe what you need and we will suggest a template or build it to your requirements.',
    },
    button: {
      label: { vi: 'Liên hệ tư vấn', en: 'Talk to us' },
      url: '/contact',
      target: '_self',
    },
  },
});

export const productsIndexPage = {
  key: 'products-index',
  title: { vi: 'Mẫu website', en: 'Templates' },
  sections: [productsHero, productsEmpty, productsCta],
  seo: {
    title: {
      vi: 'Mẫu website có sẵn — Dev House Software',
      en: 'Ready-made website templates — Dev House Software',
    },
    description: {
      vi: 'Xem thử các mẫu website bán hàng, landing page, giới thiệu doanh nghiệp và nhiều hơn nữa.',
      en: 'Try online store, landing page and business website templates, and more.',
    },
  },
};
