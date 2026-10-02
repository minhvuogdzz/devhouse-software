import { defineSection, field } from '../define.js';

export const homeHero = defineSection({
  key: 'hero',
  label: 'Hero',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 150, required: true }),
    subheading: field.textarea({ max: 400 }),
    primaryCta: field.link(),
    secondaryCta: field.link(),
    image: field.image(),
  },
  defaults: {
    eyebrow: {
      vi: 'Đối tác Kỹ thuật & Phát triển Phần mềm Doanh nghiệp',
      en: 'Enterprise Software & Technology Partner',
    },
    heading: {
      vi: 'Xây dựng giải pháp phần mềm tin cậy, tối ưu hiệu quả kinh doanh của bạn',
      en: 'Building reliable software solutions that accelerate your business outcomes',
    },
    subheading: {
      vi: 'Chúng tôi đồng hành cùng các doanh nghiệp hiện đại hóa quy trình vận hành, kiến tạo nền tảng số bảo mật và phát triển các sản phẩm phần mềm đột phá.',
      en: 'We partner with forward-thinking enterprises to modernize operational workflows, architect secure digital foundations, and deliver impactful software products.',
    },
    primaryCta: {
      label: { vi: 'Tư vấn giải pháp', en: 'Schedule Consultation' },
      url: '/contact',
      target: '_self',
    },
    secondaryCta: {
      label: { vi: 'Khám phá dịch vụ', en: 'Explore Services' },
      url: '/services',
      target: '_self',
    },
    image: { publicId: '', url: '' },
  },
});

export const homeOutcomes = defineSection({
  key: 'outcomes',
  label: 'Cam kết Giá trị',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    items: field.list({
      of: field.group({
        fields: {
          title: field.text(),
          description: field.textarea(),
          metric: field.string(),
        },
      }),
    }),
  },
  defaults: {
    heading: {
      vi: 'Tập trung vào kết quả kinh doanh và độ tin cậy lâu dài',
      en: 'Focused on measurable business outcomes and long-term stability',
    },
    subheading: {
      vi: 'Mọi dòng mã và quyết định kiến trúc đều phục vụ mục tiêu tăng trưởng thực tế của tổ chức.',
      en: 'Every architectural decision and line of code directly serves your operational growth.',
    },
    items: [
      {
        title: { vi: 'Bàn giao đúng tiến độ', en: 'Predictable Delivery' },
        description: {
          vi: 'Quy trình phát triển minh bạch với các mốc kiểm soát rõ ràng, giúp dự án luôn đi đúng định hướng.',
          en: 'Transparent delivery cycles with clear milestone verifications ensure steady progress.',
        },
        metric: '',
      },
      {
        title: { vi: 'Kiến trúc bảo mật & mở rộng', en: 'Secure & Scalable Architecture' },
        description: {
          vi: 'Hệ thống thiết kế theo tiêu chuẩn công nghiệp, sẵn sàng đáp ứng lưu lượng tăng trưởng mà không gián đoạn.',
          en: 'Industry-standard infrastructure built to handle expanding user volumes without downtime.',
        },
        metric: '',
      },
      {
        title: { vi: 'Đồng hành dài hạn', en: 'Dedicated Partnership' },
        description: {
          vi: 'Hỗ trợ kỹ thuật liên tục, bảo trì chủ động và tư vấn định hướng công nghệ theo từng giai đoạn.',
          en: 'Proactive maintenance, continuous support, and technology guidance at every lifecycle stage.',
        },
        metric: '',
      },
    ],
  },
});

export const homeProcess = defineSection({
  key: 'process',
  label: 'Quy trình Làm việc',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    steps: field.list({
      of: field.group({
        fields: {
          stepNumber: field.string(),
          title: field.text(),
          description: field.textarea(),
        },
      }),
    }),
  },
  defaults: {
    heading: {
      vi: 'Phương pháp hợp tác chặt chẽ và chuyên nghiệp',
      en: 'A collaborative, disciplined delivery framework',
    },
    subheading: {
      vi: 'Từ thấu hiểu bài toán đến hiện thực hóa giải pháp qua từng bước bài bản.',
      en: 'From discovery to delivery through proven, methodical steps.',
    },
    steps: [
      {
        stepNumber: '01',
        title: { vi: 'Khảo sát & Tư vấn', en: 'Discovery & Advisory' },
        description: {
          vi: 'Phân tích kỹ lưỡng mục tiêu kinh doanh, khảo sát hiện trạng hệ thống và xác định phạm vi giải pháp.',
          en: 'Analyze operational requirements, evaluate existing systems, and establish project scope.',
        },
      },
      {
        stepNumber: '02',
        title: { vi: 'Thiết kế & Kiến trúc', en: 'Architecture & UX Design' },
        description: {
          vi: 'Xây dựng kiến trúc hệ thống chuẩn mực và thiết kế trải nghiệm người dùng tối ưu trước khi phát triển.',
          en: 'Formulate robust system architecture and seamless user journeys prior to implementation.',
        },
      },
      {
        stepNumber: '03',
        title: { vi: 'Phát triển & Kiểm thử', en: 'Iterative Development & QA' },
        description: {
          vi: 'Lập trình tuần tự theo từng vòng lặp, kiểm thử tự động toàn diện đảm bảo chất lượng cao nhất.',
          en: 'Iterative sprints backed by automated testing suites for resilient software quality.',
        },
      },
      {
        stepNumber: '04',
        title: { vi: 'Triển khai & Vận hành', en: 'Deployment & Support' },
        description: {
          vi: 'Bàn giao hệ thống an toàn trên môi trường vận hành thực tế và đào tạo đội ngũ chuyển giao.',
          en: 'Zero-disruption production deployment accompanied by thorough team onboarding and monitoring.',
        },
      },
    ],
  },
});

export const homeCta = defineSection({
  key: 'cta',
  label: 'Kêu gọi Hành động',
  fields: {
    heading: field.text({ max: 150 }),
    subheading: field.textarea({ max: 300 }),
    primaryCta: field.link(),
    secondaryCta: field.link(),
  },
  defaults: {
    heading: {
      vi: 'Sẵn sàng khởi động dự án phần mềm tiếp theo của bạn?',
      en: 'Ready to bring your next software initiative to life?',
    },
    subheading: {
      vi: 'Liên hệ với đội ngũ chuyên gia của chúng tôi để nhận tư vấn lộ trình và ước tính chi phí chi tiết.',
      en: 'Connect with our engineering leads for a strategic consultation and actionable project roadmap.',
    },
    primaryCta: {
      label: { vi: 'Gửi yêu cầu hợp tác', en: 'Get in Touch' },
      url: '/contact',
      target: '_self',
    },
    secondaryCta: {
      label: { vi: 'Xem hồ sơ năng lực', en: 'Our Capabilities' },
      url: '/about',
      target: '_self',
    },
  },
});

export const homePage = {
  key: 'home',
  title: { vi: 'Trang chủ', en: 'Home' },
  sections: [homeHero, homeOutcomes, homeProcess, homeCta],
  seo: {
    title: {
      vi: 'Dev House Software — Phát triển Phần mềm Doanh nghiệp & Giải pháp AI',
      en: 'Dev House Software — Enterprise Engineering & AI Solutions',
    },
    description: {
      vi: 'Tư vấn và phát triển phần mềm theo yêu cầu, hệ thống quản trị doanh nghiệp và giải pháp số chuyên sâu.',
      en: 'Custom enterprise software development, modern operational platforms, and specialized digital solutions.',
    },
  },
};
