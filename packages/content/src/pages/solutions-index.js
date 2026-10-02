import { defineSection, field } from '../define.js';

export const solutionsHero = defineSection({
  key: 'hero',
  label: 'Hero Giải pháp',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Gói Giải pháp Đóng gói Sẵn sàng',
      en: 'Outcome-Oriented Solution Packages',
    },
    heading: {
      vi: 'Giải pháp chuyển đổi số toàn diện cho doanh nghiệp tăng trưởng',
      en: 'Targeted digital transformation suites designed for measurable impact',
    },
    subheading: {
      vi: 'Kết hợp hài hòa giữa các dịch vụ công nghệ then chốt để giải quyết trọn vẹn những bài toán vận hành phức tạp nhất.',
      en: 'Integrated bundles combining core software competencies to address mission-critical business challenges.',
    },
  },
});

export const solutionsIndexPage = {
  key: 'solutions-index',
  title: { vi: 'Giải pháp', en: 'Solutions' },
  sections: [solutionsHero],
  seo: {
    title: {
      vi: 'Giải pháp Số & Tự động hóa Doanh nghiệp — Dev House Software',
      en: 'Enterprise Digital Solutions & Automation — Dev House Software',
    },
    description: {
      vi: 'Các gói giải pháp chuyển đổi số, ERP nội bộ và hệ thống tự động hóa thông minh cho doanh nghiệp vừa và lớn.',
      en: 'Digital transformation suites, internal operations systems, and intelligent automation platforms.',
    },
  },
};
