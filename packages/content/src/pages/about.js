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

export const aboutCompany = defineSection({
  key: 'company',
  label: 'Thông tin công ty',
  fields: {
    heading: field.text({ max: 120 }),
    intro: field.textarea({ max: 600 }),
    groupNote: field.textarea({ max: 400 }),
    offeringsHeading: field.text({ max: 120 }),
    offerings: field.list({
      of: field.group({
        fields: {
          title: field.text(),
          description: field.textarea(),
        },
      }),
    }),
  },
  defaults: {
    heading: { vi: 'Về Dev House Software', en: 'About Dev House Software' },
    intro: {
      vi: 'Dev House Software là công ty công nghệ thuộc Dev House Group, có trụ sở tại Hà Nội. Chúng tôi thiết kế và xây dựng website, ứng dụng, phần mềm quản lý, giải pháp AI và tự động hoá, giúp doanh nghiệp làm việc nhanh hơn và bán hàng tốt hơn.',
      en: 'Dev House Software is a technology company within Dev House Group, based in Hanoi. We design and build websites, apps, business software, AI and automation that help companies work faster and sell better.',
    },
    groupNote: {
      vi: 'Dev House Group là tổ chức mẹ, do ông Dương Minh Vương sáng lập. Dev House Software phụ trách mảng phát triển phần mềm và giải pháp công nghệ cho khách hàng.',
      en: 'Dev House Group is the parent organization, founded by Dương Minh Vương. Dev House Software handles software development and technology solutions for clients.',
    },
    offeringsHeading: { vi: 'Chúng tôi giúp bạn việc gì', en: 'What we help you with' },
    offerings: [
      {
        title: { vi: 'Website và ứng dụng', en: 'Websites and apps' },
        description: {
          vi: 'Website, ứng dụng web, ứng dụng di động và phần mềm máy tính được làm đúng theo nhu cầu của bạn.',
          en: 'Websites, web apps, mobile apps and desktop software built around what you actually need.',
        },
      },
      {
        title: { vi: 'Phần mềm quản lý', en: 'Business software' },
        description: {
          vi: 'Hệ thống nội bộ giúp quản lý bán hàng, vận hành và chăm sóc khách hàng gọn gàng hơn.',
          en: 'Internal systems that keep sales, operations and customer care organized.',
        },
      },
      {
        title: { vi: 'AI và tự động hoá', en: 'AI and automation' },
        description: {
          vi: 'Trợ lý AI và các quy trình tự động giúp giảm việc lặp đi lặp lại và tiết kiệm thời gian.',
          en: 'AI assistants and automated workflows that cut repetitive work and save time.',
        },
      },
    ],
  },
});

export const aboutLeadership = defineSection({
  key: 'leadership',
  label: 'Sơ đồ tổ chức',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    // Org chart as a tree: each node points at its parent by id ('' = top of the chart).
    // A node can hold one person, or several people shown together as a group (e.g. a board).
    nodes: field.list({
      of: field.group({
        fields: {
          id: field.string({ max: 40 }),
          parent: field.string({ max: 40 }),
          label: field.text({ max: 80 }),
          members: field.list({
            of: field.group({
              fields: {
                name: field.string({ max: 80 }),
                role: field.text({ max: 120 }),
              },
            }),
          }),
        },
      }),
    }),
  },
  defaults: {
    heading: { vi: 'Sơ đồ tổ chức', en: 'Our organization' },
    subheading: {
      vi: 'Đội ngũ sáng lập và điều hành đứng sau Dev House Software.',
      en: 'The founders and leaders behind Dev House Software.',
    },
    nodes: [
      {
        id: 'ceo',
        parent: '',
        members: [
          {
            name: 'Dương Minh Vương',
            role: {
              vi: 'CEO, Nhà sáng lập Dev House Group',
              en: 'CEO and Founder, Dev House Group',
            },
          },
        ],
      },
      {
        id: 'cto',
        parent: 'ceo',
        members: [
          {
            name: 'Nguyễn Thành Lâm',
            role: { vi: 'Giám đốc Công nghệ (CTO), Đồng sáng lập', en: 'CTO and Co-Founder' },
          },
        ],
      },
      {
        id: 'board',
        parent: 'ceo',
        label: { vi: 'Ban giám đốc Dev House Software', en: 'Dev House Software Directors' },
        members: [
          {
            name: 'Lưu Công Hải',
            role: { vi: 'Đồng sáng lập, Giám đốc', en: 'Co-Founder and Director' },
          },
          {
            name: 'Nguyễn Hữu Trọng Anh',
            role: { vi: 'Đồng sáng lập, Giám đốc', en: 'Co-Founder and Director' },
          },
        ],
      },
      {
        id: 'product',
        parent: 'board',
        members: [
          {
            name: 'Nguyễn Đức Việt',
            role: { vi: 'Giám đốc Sản phẩm (CPO)', en: 'Chief Product Officer (CPO)' },
          },
        ],
      },
      {
        id: 'hr',
        parent: 'board',
        members: [
          {
            name: 'Lê Trương Nguyễn Hoàng',
            role: { vi: 'Giám đốc Hành chính Nhân sự', en: 'Head of Administration and HR' },
          },
        ],
      },
    ],
  },
});

export const aboutServiceTerms = defineSection({
  key: 'serviceTerms',
  label: 'Điều khoản dịch vụ (tóm tắt)',
  fields: {
    heading: field.text({ max: 120 }),
    intro: field.textarea({ max: 400 }),
    items: field.list({
      of: field.group({
        fields: {
          title: field.text(),
          description: field.textarea(),
        },
      }),
    }),
    linkLabel: field.text({ max: 80 }),
  },
  defaults: {
    heading: { vi: 'Điều khoản dịch vụ', en: 'Service terms' },
    intro: {
      vi: 'Tóm tắt cách chúng tôi làm việc với khách hàng. Nội dung đầy đủ có tại trang Điều khoản sử dụng.',
      en: 'A short summary of how we work with clients. The full text is on the Terms of Service page.',
    },
    items: [
      {
        title: { vi: 'Báo giá rõ ràng', en: 'Clear quotes' },
        description: {
          vi: 'Mỗi dự án có phạm vi công việc và báo giá bằng văn bản trước khi bắt đầu.',
          en: 'Every project has a written scope and quote before work begins.',
        },
      },
      {
        title: { vi: 'Thanh toán theo giai đoạn', en: 'Staged payments' },
        description: {
          vi: 'Chi phí được chia theo các mốc bàn giao đã thống nhất với bạn.',
          en: 'Costs are split across delivery milestones agreed with you.',
        },
      },
      {
        title: { vi: 'Thay đổi yêu cầu', en: 'Changes to requirements' },
        description: {
          vi: 'Phần phát sinh ngoài phạm vi sẽ được báo trước về thời gian và chi phí, chỉ thực hiện khi bạn đồng ý.',
          en: 'Extra work outside the scope is quoted for time and cost first, and only done once you agree.',
        },
      },
      {
        title: { vi: 'Bảo mật thông tin', en: 'Confidentiality' },
        description: {
          vi: 'Thông tin của bạn được giữ kín. Chúng tôi sẵn sàng ký thỏa thuận bảo mật (NDA).',
          en: 'Your information stays private. We are happy to sign a non-disclosure agreement (NDA).',
        },
      },
      {
        title: { vi: 'Quyền sở hữu sản phẩm', en: 'Ownership' },
        description: {
          vi: 'Sau khi thanh toán đủ, bạn sở hữu sản phẩm được bàn giao theo hợp đồng.',
          en: 'Once payment is complete, you own the product delivered under the contract.',
        },
      },
      {
        title: { vi: 'Bảo hành và hỗ trợ', en: 'Warranty and support' },
        description: {
          vi: 'Thời gian bảo hành và hỗ trợ sau bàn giao được ghi rõ trong hợp đồng của từng dự án.',
          en: 'Warranty and after-delivery support are written into each project contract.',
        },
      },
    ],
    linkLabel: { vi: 'Xem điều khoản đầy đủ', en: 'Read the full terms' },
  },
});

export const aboutPage = {
  key: 'about',
  title: { vi: 'Giới thiệu', en: 'About' },
  sections: [aboutHero, aboutCompany, aboutLeadership, aboutMission, aboutServiceTerms],
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
