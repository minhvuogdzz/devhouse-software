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
      vi: 'Chúng tôi lo phần kỹ thuật để bạn tập trung kinh doanh',
      en: 'We take care of the technology so you can focus on your business',
    },
    subheading: {
      vi: 'Dev House Software dựng website, vận hành máy chủ, lo tên miền và bảo mật cho cửa hàng và doanh nghiệp nhỏ, từ Việt Nam.',
      en: 'Dev House Software builds websites, runs servers and looks after domains and security for shops and small businesses, starting in Vietnam.',
    },
  },
});

export const aboutMission = defineSection({
  key: 'mission',
  label: 'Giá trị cam kết',
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
      vi: 'Bốn giá trị chúng tôi cam kết với khách hàng',
      en: 'The four values we promise our customers',
    },
    values: [
      {
        title: { vi: 'An toàn', en: 'Safe' },
        description: {
          vi: 'Kết nối HTTPS bắt buộc, tường lửa, chống tấn công quá tải cơ bản và vá bảo mật định kỳ.',
          en: 'HTTPS on every site, a firewall, basic protection against overload attacks and regular security patches.',
        },
      },
      {
        title: { vi: 'Ổn định', en: 'Stable' },
        description: {
          vi: 'Giám sát liên tục, sao lưu tự động và có người xử lý khi web gặp sự cố.',
          en: 'Constant monitoring, automatic backups and someone to fix problems when they happen.',
        },
      },
      {
        title: { vi: 'Đơn giản', en: 'Simple' },
        description: {
          vi: 'Một đầu mối cho website, máy chủ và tên miền. Bạn không cần hiểu kỹ thuật.',
          en: 'One contact for your website, hosting and domain. You do not need to understand the technology.',
        },
      },
      {
        title: { vi: 'Minh bạch', en: 'Transparent' },
        description: {
          vi: 'Giá và phạm vi hỗ trợ ghi rõ trước khi ký hợp đồng. Tên miền đứng tên bạn.',
          en: 'Prices and the scope of support are written down before you sign. Your domain stays in your name.',
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
      vi: 'Dev House Software là công ty công nghệ thuộc Dev House Group, có trụ sở tại Hà Nội. Chúng tôi bán trọn gói website, máy chủ, tên miền và bảo mật, rồi đồng hành vận hành lâu dài để bạn không phải lo phần kỹ thuật.',
      en: 'Dev House Software is a technology company within Dev House Group, based in Hanoi. We offer websites, hosting, domains and security as one package, and keep running them for you so you never have to deal with the technical side.',
    },
    groupNote: {
      vi: 'Dev House Group là tổ chức mẹ, do ông Dương Minh Vương sáng lập. Dev House Software phụ trách mảng website và hạ tầng cho khách hàng.',
      en: 'Dev House Group is the parent organization, founded by Dương Minh Vương. Dev House Software looks after websites and hosting for clients.',
    },
    offeringsHeading: { vi: 'Bốn nhóm dịch vụ của chúng tôi', en: 'Our four services' },
    offerings: [
      {
        title: { vi: 'Thiết kế website', en: 'Website design' },
        description: {
          vi: 'Website giới thiệu, landing page và web bán hàng nhỏ, dựng từ mẫu chuẩn.',
          en: 'Business sites, landing pages and small online shops, built from proven templates.',
        },
      },
      {
        title: { vi: 'Máy chủ và hạ tầng đám mây', en: 'Cloud hosting' },
        description: {
          vi: 'Website chạy trên máy chủ an toàn, có giám sát, sao lưu và cập nhật bảo mật.',
          en: 'Your site runs on secure servers with monitoring, backups and security updates.',
        },
      },
      {
        title: { vi: 'Tên miền và DNS', en: 'Domain and DNS' },
        description: {
          vi: 'Đăng ký, gia hạn và cấu hình tên miền, email theo tên miền. Tên miền đứng tên bạn.',
          en: 'We register, renew and configure your domain and email. The domain stays in your name.',
        },
      },
      {
        title: { vi: 'Bảo mật và hỗ trợ', en: 'Security and support' },
        description: {
          vi: 'Tường lửa, xử lý sự cố và chỉnh sửa nhỏ trong số giờ hỗ trợ của gói.',
          en: 'A firewall, fixing problems and small edits within the support hours of your package.',
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
      vi: 'Tóm tắt cách chúng tôi làm việc với khách hàng. Nội dung đầy đủ có tại trang Điều khoản dịch vụ.',
      en: 'A short summary of how we work with clients. The full text is on the Terms of Service page.',
    },
    items: [
      {
        title: { vi: 'Hợp đồng ghi rõ phạm vi', en: 'A contract that spells out the scope' },
        description: {
          vi: 'Phạm vi công việc, giờ hỗ trợ, chủ sở hữu tên miền và dữ liệu đều được ghi rõ trước khi bắt đầu.',
          en: 'The scope of work, support hours and who owns the domain and data are written down before we start.',
        },
      },
      {
        title: { vi: 'Thanh toán theo giai đoạn', en: 'Staged payments' },
        description: {
          vi: 'Trả trước tối thiểu 50% phí cài đặt khi ký hợp đồng, phần còn lại khi bàn giao.',
          en: 'At least 50% of the setup fee is paid when the contract is signed and the rest on delivery.',
        },
      },
      {
        title: { vi: 'Phí duy trì theo quý hoặc năm', en: 'Recurring fees per quarter or year' },
        description: {
          vi: 'Không thu theo tháng, để bạn đỡ phải theo dõi thanh toán.',
          en: 'We never bill monthly, so there is less to keep track of.',
        },
      },
      {
        title: { vi: 'Tên miền đứng tên bạn', en: 'Your domain stays yours' },
        description: {
          vi: 'Tên miền được đăng ký bằng tên bạn và gia hạn mỗi năm, trước ngày hết hạn.',
          en: 'The domain is registered in your name and renewed every year before it expires.',
        },
      },
      {
        title: { vi: 'Việc ngoài phạm vi', en: 'Work outside the scope' },
        description: {
          vi: 'Khi vượt số giờ hỗ trợ của gói, chúng tôi báo giá riêng và chỉ làm khi bạn đồng ý.',
          en: 'When work goes beyond the support hours of your package we quote it separately and only start once you agree.',
        },
      },
      {
        title: { vi: 'Kết thúc hợp đồng', en: 'Ending the contract' },
        description: {
          vi: 'Bạn nhận lại mã nguồn, bản sao lưu dữ liệu và quyền quản lý tên miền.',
          en: 'You receive your source code, a backup of your data and control of your domain.',
        },
      },
    ],
    linkLabel: { vi: 'Xem điều khoản đầy đủ', en: 'Read the full terms' },
  },
});

export const aboutPage = {
  key: 'about',
  title: { vi: 'Về Dev House', en: 'About Dev House' },
  sections: [aboutHero, aboutCompany, aboutLeadership, aboutMission, aboutServiceTerms],
  seo: {
    title: {
      vi: 'Về chúng tôi — Dev House Software',
      en: 'About us — Dev House Software',
    },
    description: {
      vi: 'Dev House Software là ai, làm gì, và cam kết gì với khách hàng: an toàn, ổn định, đơn giản và minh bạch.',
      en: 'Who Dev House Software is, what we do and what we promise our customers: safe, stable, simple and transparent.',
    },
  },
};
