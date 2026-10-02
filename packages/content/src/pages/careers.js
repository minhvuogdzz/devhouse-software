import { defineSection, field } from '../define.js';

export const careersHero = defineSection({
  key: 'hero',
  label: 'Hero Tuyển dụng',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Cơ hội Nghề nghiệp',
      en: 'Careers at Dev House',
    },
    heading: {
      vi: 'Cùng xây dựng những sản phẩm công nghệ có giá trị thực sự',
      en: 'Build impactful technology products with our engineering collective',
    },
    subheading: {
      vi: 'Chúng tôi tìm kiếm những kỹ sư tài năng, yêu thích giải quyết bài toán phức tạp và đề cao tinh thần trách nhiệm trong công việc.',
      en: 'We are looking for dedicated engineers who thrive on technical challenges and take true pride in their craftsmanship.',
    },
  },
});

export const careersCulture = defineSection({
  key: 'culture',
  label: 'Văn hóa & Đãi ngộ',
  fields: {
    heading: field.text({ max: 120 }),
    items: field.list({
      of: field.group({
        fields: {
          title: field.text(),
          description: field.textarea(),
        },
      }),
    }),
  },
  defaults: {
    heading: {
      vi: 'Môi trường làm việc tôn trọng và tạo điều kiện phát triển',
      en: 'A collaborative environment designed for sustained professional growth',
    },
    items: [
      {
        title: { vi: 'Học hỏi & Nâng tầm Kỹ năng', en: 'Continuous Learning' },
        description: {
          vi: 'Cơ hội tiếp cận các dự án kỹ thuật thử thách, quy trình chuẩn mực và định hướng thăng tiến rõ ràng.',
          en: 'Work on demanding enterprise projects with industry-standard practices and a clear growth trajectory.',
        },
      },
      {
        title: { vi: 'Tự chủ & Linh hoạt', en: 'Autonomy & Flexibility' },
        description: {
          vi: 'Được trao quyền quyết định giải pháp kỹ thuật, đánh giá dựa trên kết quả bàn giao thực chất.',
          en: 'Empowered to make architectural decisions and evaluated purely on substantive delivery outcomes.',
        },
      },
      {
        title: { vi: 'Đãi ngộ Cạnh tranh', en: 'Competitive Compensation' },
        description: {
          vi: 'Chế độ lương thưởng tương xứng năng lực, xem xét định kỳ và chăm sóc sức khỏe toàn diện.',
          en: 'Competitive remuneration, regular performance reviews, and comprehensive health benefits.',
        },
      },
    ],
  },
});

export const careersPage = {
  key: 'careers',
  title: { vi: 'Tuyển dụng', en: 'Careers' },
  sections: [careersHero, careersCulture],
  seo: {
    title: {
      vi: 'Cơ hội Nghề nghiệp — Dev House Software',
      en: 'Careers & Opportunities — Dev House Software',
    },
    description: {
      vi: 'Khám phá các vị trí tuyển dụng kỹ sư phần mềm, kiến trúc sư hệ thống tại Dev House Software.',
      en: 'Discover open software engineering and technical roles at Dev House Software.',
    },
  },
};
