import { defineSection, field } from '../define.js';

export const aboutHero = defineSection({
  key: 'hero',
  label: 'Hero Giới thiệu',
  fields: {
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    heading: {
      vi: 'Chúng tôi xây dựng phần mềm phục vụ sự phát triển bền vững của doanh nghiệp',
      en: 'We build dependable software that fuels long-term enterprise growth',
    },
    subheading: {
      vi: 'Dev House Software tập hợp những kỹ sư tâm huyết, am hiểu sâu sắc bài toán kinh doanh thực tế để tạo ra những giải pháp công nghệ chuẩn mực và hiệu quả.',
      en: 'Dev House Software unites dedicated engineers with a deep understanding of business strategy to craft resilient, high-impact digital systems.',
    },
  },
});

export const aboutMission = defineSection({
  key: 'mission',
  label: 'Sứ mệnh & Giá trị cốt lõi',
  fields: {
    heading: field.text({ max: 120 }),
    values: field.list({
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
      vi: 'Những nguyên tắc định hình văn hóa hợp tác của chúng tôi',
      en: 'The core values that guide every collaboration',
    },
    values: [
      {
        title: { vi: 'Trung thực & Minh bạch', en: 'Integrity & Transparency' },
        description: {
          vi: 'Luôn báo cáo thực chất, thẳng thắn về tiến độ, rủi ro và các phương án xử lý tối ưu nhất cho khách hàng.',
          en: 'Uncompromised candor regarding project timelines, potential risks, and optimal solutions.',
        },
      },
      {
        title: { vi: 'Chất lượng Kỹ thuật Chuẩn mực', en: 'Engineering Rigor' },
        description: {
          vi: 'Không cắt ngắn quy trình kiểm thử và kiến trúc; chú trọng tính ổn định, bảo mật và khả năng bảo trì dài hạn.',
          en: 'No shortcuts in testing or architecture; prioritizing resilience, security, and clean maintenance.',
        },
      },
      {
        title: { vi: 'Tập trung vào Giá trị Thực tế', en: 'Outcome-Driven Value' },
        description: {
          vi: 'Phần mềm chỉ có ý nghĩa khi đem lại lợi ích vận hành rõ ràng và tạo đột phá hiệu suất cho tổ chức.',
          en: 'Software succeeds only when it creates measurable business velocity and operational efficiency.',
        },
      },
    ],
  },
});

export const aboutPage = {
  key: 'about',
  title: { vi: 'Giới thiệu', en: 'About' },
  sections: [aboutHero, aboutMission],
  seo: {
    title: {
      vi: 'Giới thiệu về Dev House Software — Đội ngũ Kỹ sư Công nghệ Chuyên nghiệp',
      en: 'About Dev House Software — Enterprise Engineering & Consulting',
    },
    description: {
      vi: 'Tìm hiểu về văn hóa, sứ mệnh và năng lực triển khai các dự án phần mềm quy mô lớn của Dev House Software.',
      en: 'Learn about our mission, culture, and track record in delivering high-assurance software systems.',
    },
  },
};
