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
      vi: 'Đối tác Phát triển Phần mềm Doanh nghiệp',
      en: 'Enterprise Software Partner',
    },
    heading: {
      vi: 'Xây dựng phần mềm tin cậy, giúp doanh nghiệp vận hành hiệu quả',
      en: 'Building reliable software tools that accelerate your business',
    },
    subheading: {
      vi: 'Chúng tôi đồng hành cùng các tổ chức tối ưu quy trình làm việc và phát triển các sản phẩm phần mềm thực tế, dễ sử dụng.',
      en: 'We partner with organizations to improve their daily workflows, build secure foundations, and deliver software that works.',
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
      vi: 'Tập trung vào kết quả kinh doanh và hiệu quả lâu dài',
      en: 'Focused on measurable business results and long-term stability',
    },
    subheading: {
      vi: 'Mọi tính năng và quyết định phát triển đều phục vụ mục tiêu tăng trưởng thực tế của tổ chức.',
      en: 'Every technical decision we make directly serves your operational growth.',
    },
    items: [
      {
        title: { vi: 'Bàn giao đúng tiến độ', en: 'Predictable Delivery' },
        description: {
          vi: 'Quy trình minh bạch với các mốc kiểm soát rõ ràng, giúp dự án đi đúng hướng từ ngày đầu tiên.',
          en: 'Transparent processes with clear milestones ensure your project stays on track.',
        },
        metric: '',
      },
      {
        title: { vi: 'Hệ thống an toàn & ổn định', en: 'Secure & Stable Systems' },
        description: {
          vi: 'Phần mềm được thiết kế cẩn thận, sẵn sàng đáp ứng lượng người dùng lớn mà không bị gián đoạn.',
          en: 'Well-built systems designed to handle your expanding business without unexpected downtime.',
        },
        metric: '',
      },
      {
        title: { vi: 'Đồng hành dài hạn', en: 'Dedicated Partnership' },
        description: {
          vi: 'Hỗ trợ liên tục, bảo trì chủ động và luôn tư vấn giải pháp phù hợp nhất theo từng giai đoạn.',
          en: 'Proactive maintenance, reliable support, and honest guidance at every stage of your growth.',
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
      vi: 'Cách chúng tôi làm việc cùng bạn',
      en: 'A clear process to build your software',
    },
    subheading: {
      vi: 'Từ lúc bắt đầu tìm hiểu vấn đề đến khi phần mềm được đưa vào sử dụng thực tế.',
      en: 'From planning the first idea to launching the final tool for your team.',
    },
    steps: [
      {
        stepNumber: '01',
        title: { vi: 'Tìm hiểu yêu cầu', en: 'Planning & Requirements' },
        description: {
          vi: 'Cùng thảo luận để hiểu rõ mục tiêu kinh doanh và những khó khăn hiện tại của bạn.',
          en: 'We talk with your team to understand your business goals and current challenges.',
        },
      },
      {
        stepNumber: '02',
        title: { vi: 'Thiết kế giải pháp', en: 'Design & Prototype' },
        description: {
          vi: 'Lên bản vẽ cách phần mềm hoạt động và giao diện để đảm bảo mọi thứ dễ sử dụng.',
          en: 'We map out how the software will work and look, ensuring it is easy to use.',
        },
      },
      {
        stepNumber: '03',
        title: { vi: 'Lập trình & Kiểm tra', en: 'Development & Testing' },
        description: {
          vi: 'Viết mã nguồn và liên tục kiểm tra để đảm bảo phần mềm hoạt động ổn định và không có lỗi.',
          en: 'We write the code and test it constantly to make sure everything works perfectly without errors.',
        },
      },
      {
        stepNumber: '04',
        title: { vi: 'Bàn giao & Hỗ trợ', en: 'Launch & Support' },
        description: {
          vi: 'Đưa phần mềm vào sử dụng thực tế, hướng dẫn nhân viên và tiếp tục hỗ trợ khi cần thiết.',
          en: 'We launch the software for your team to use and provide ongoing help whenever you need it.',
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
      vi: 'Bạn cần xây dựng một phần mềm mới?',
      en: 'Ready to build your next software tool?',
    },
    subheading: {
      vi: 'Liên hệ với chúng tôi để thảo luận về ý tưởng của bạn và nhận báo giá chi tiết.',
      en: 'Contact us to discuss your ideas and get a detailed cost estimate.',
    },
    primaryCta: {
      label: { vi: 'Liên hệ ngay', en: 'Get in Touch' },
      url: '/contact',
      target: '_self',
    },
    secondaryCta: {
      label: { vi: 'Tìm hiểu thêm', en: 'About Us' },
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
      vi: 'Dev House Software — Xây dựng phần mềm doanh nghiệp',
      en: 'Dev House Software — Enterprise Software Development',
    },
    description: {
      vi: 'Dịch vụ làm phần mềm theo yêu cầu và xây dựng các công cụ giúp doanh nghiệp quản lý công việc hiệu quả.',
      en: 'Custom software development and tools to help your business operate efficiently.',
    },
  },
};
