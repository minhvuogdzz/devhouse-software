import { defineSection, field } from '../define.js';
import { ICON_KEYS, makeDisplay } from '@devhouse/shared';

const cardList = withIcon =>
  field.list({
    of: field.group({
      fields: {
        ...(withIcon ? { icon: field.select({ options: ICON_KEYS }) } : {}),
        title: field.text({ max: 80 }),
        description: field.textarea({ max: 300 }),
      },
    }),
  });

export const homeHero = defineSection({
  key: 'hero',
  label: 'Hero (đầu trang)',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 150, required: true }),
    subheading: field.textarea({ max: 400 }),
    primaryCta: field.link(),
    secondaryCta: field.link(),
    highlights: field.list({ of: field.text({ max: 60 }), max: 4 }),
  },
  defaults: {
    eyebrow: {
      vi: 'Website, máy chủ, tên miền và bảo mật trọn gói',
      en: 'Website, hosting, domain and security in one package',
    },
    heading: {
      vi: 'Website an toàn và ổn định, bạn không phải lo kỹ thuật',
      en: 'A safe, stable website, with no technical worries',
    },
    subheading: {
      vi: 'Dev House dựng website từ mẫu chuẩn, chạy trên máy chủ đám mây, lo tên miền, bảo mật và xử lý sự cố. Bạn chỉ cần tập trung vào việc kinh doanh.',
      en: 'Dev House builds your website from proven templates, runs it on cloud servers and takes care of your domain, security and fixes. You focus on your business.',
    },
    primaryCta: {
      label: { vi: 'Xem gói dịch vụ', en: 'See our packages' },
      url: '/packages',
      target: '_self',
    },
    secondaryCta: {
      label: { vi: 'Xem mẫu website', en: 'Browse templates' },
      url: '/products',
      target: '_self',
    },
    highlights: [
      { vi: 'Kết nối an toàn (HTTPS)', en: 'Secure connection (HTTPS)' },
      { vi: 'Sao lưu tự động', en: 'Automatic backups' },
      { vi: 'Có người xử lý khi web gặp sự cố', en: 'Someone fixes problems for you' },
    ],
  },
});

export const homeValues = defineSection({
  key: 'values',
  label: 'Bốn giá trị cam kết',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    items: cardList(true),
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
    heading: { vi: 'Bốn điều chúng tôi cam kết', en: 'Four things we promise' },
    subheading: {
      vi: 'Website an toàn, hạ tầng chuẩn, và bạn không phải lo kỹ thuật.',
      en: 'A safe website, solid foundations, and no technical worries for you.',
    },
    items: [
      {
        icon: 'shield',
        title: { vi: 'An toàn', en: 'Safe' },
        description: {
          vi: 'Kết nối HTTPS bắt buộc, tường lửa, chống tấn công quá tải cơ bản và vá bảo mật định kỳ.',
          en: 'HTTPS on every site, a firewall, basic protection against overload attacks and regular security patches.',
        },
      },
      {
        icon: 'clock',
        title: { vi: 'Ổn định', en: 'Stable' },
        description: {
          vi: 'Giám sát liên tục, sao lưu tự động và có người xử lý khi web gặp sự cố.',
          en: 'Constant monitoring, automatic backups and someone to fix problems when they happen.',
        },
      },
      {
        icon: 'check',
        title: { vi: 'Đơn giản', en: 'Simple' },
        description: {
          vi: 'Một đầu mối cho website, máy chủ và tên miền. Bạn không cần hiểu kỹ thuật.',
          en: 'One contact for your website, hosting and domain. You do not need to understand the technology.',
        },
      },
      {
        icon: 'file-text',
        title: { vi: 'Minh bạch', en: 'Transparent' },
        description: {
          vi: 'Giá và phạm vi hỗ trợ ghi rõ trước khi ký hợp đồng. Tên miền đứng tên bạn.',
          en: 'Prices and the scope of support are written down before you sign. Your domain stays in your name.',
        },
      },
    ],
  },
});

export const homeServicesIntro = defineSection({
  key: 'servicesIntro',
  label: 'Mục Dịch vụ trên trang chủ',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({
      layout: 'slide',
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      slide: { motion: 'smooth', interval: 6, dots: 'none' },
    }),
    heading: { vi: 'Bốn nhóm dịch vụ, một đầu mối', en: 'Four services, one contact' },
    subheading: {
      vi: 'Từ lúc dựng website đến khi web chạy ổn định, an toàn và có sao lưu.',
      en: 'From building the website to keeping it running, safe and backed up.',
    },
  },
});

export const homeProductsIntro = defineSection({
  key: 'productsIntro',
  label: 'Mục Mẫu website trên trang chủ',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({
      layout: 'slide',
      columns: { mobile: 2, tablet: 3, desktop: 5 },
      slide: { motion: 'smooth', interval: 5, dots: 'none' },
    }),
    heading: { vi: 'Mẫu website có sẵn', en: 'Ready-made website templates' },
    subheading: {
      vi: 'Xem thử ngay trên trang này, chọn mẫu phù hợp rồi để chúng tôi triển khai cho bạn.',
      en: 'Try them right here, pick the one you like and we will set it up for you.',
    },
  },
});

export const homeAudiences = defineSection({
  key: 'audiences',
  label: 'Dành cho ai',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    items: cardList(true),
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
    heading: { vi: 'Dành cho ai?', en: 'Who is it for?' },
    subheading: {
      vi: 'Chúng tôi bắt đầu với những khách hàng cần một website ổn định mà không muốn đau đầu vì kỹ thuật.',
      en: 'We start with people who need a dependable website and do not want to deal with the technical side.',
    },
    items: [
      {
        icon: 'rocket',
        title: { vi: 'Sinh viên', en: 'Students' },
        description: {
          vi: 'Đưa đồ án hoặc dự án cá nhân lên mạng nhanh, có tên miền và HTTPS để nộp bài hoặc trình diễn, với chi phí thấp.',
          en: 'Get a course or personal project online quickly, with a domain and HTTPS to hand in or present, at a low cost.',
        },
      },
      {
        icon: 'store',
        title: { vi: 'Cửa hàng, quán ăn', en: 'Shops and cafes' },
        description: {
          vi: 'Có website giới thiệu hoặc bán hàng ổn định, giá hợp lý, không phải lo kỹ thuật.',
          en: 'Have a dependable website to present or sell your products, at a fair price, with nothing technical to handle.',
        },
      },
      {
        icon: 'users',
        title: { vi: 'Doanh nghiệp nhỏ, startup', en: 'Small businesses and startups' },
        description: {
          vi: 'Cần hạ tầng chuẩn, bảo mật tốt, cập nhật website tự động và cam kết thời gian phản hồi.',
          en: 'Need solid foundations, good security, automatic website updates and a commitment on response time.',
        },
      },
    ],
  },
});

export const homePackagesIntro = defineSection({
  key: 'packagesIntro',
  label: 'Mục Gói dịch vụ trên trang chủ',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display({ maxColumns: 4 }),
  },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
    heading: { vi: 'Gói dịch vụ', en: 'Packages' },
    subheading: {
      vi: 'Chọn gói theo nhu cầu: phí cài đặt một lần cộng phí duy trì theo quý hoặc năm.',
      en: 'Choose the package that fits: a one-time setup fee plus a recurring fee per quarter or year.',
    },
  },
});

export const homeProcess = defineSection({
  key: 'process',
  label: 'Quy trình làm việc',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    steps: field.list({
      of: field.group({
        fields: {
          stepNumber: field.string({ max: 4 }),
          title: field.text({ max: 80 }),
          description: field.textarea({ max: 300 }),
        },
      }),
    }),
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 5 } }),
    heading: { vi: 'Năm bước để có website của bạn', en: 'Five steps to your website' },
    subheading: {
      vi: 'Khách hàng nào cũng đi qua cùng một quy trình, để bạn biết trước mỗi bước sẽ diễn ra thế nào.',
      en: 'Every customer follows the same process, so you know what to expect at each step.',
    },
    steps: [
      {
        stepNumber: '01',
        title: { vi: 'Tiếp nhận và chốt gói', en: 'Intake and choosing a package' },
        description: {
          vi: 'Nắm nhu cầu, chọn gói và ký hợp đồng ghi rõ phạm vi, giờ hỗ trợ, chủ sở hữu tên miền và dữ liệu.',
          en: 'We learn what you need, you pick a package and we sign a contract that spells out the scope, support hours and who owns the domain and data.',
        },
      },
      {
        stepNumber: '02',
        title: { vi: 'Dựng website và hạ tầng', en: 'Building the site and hosting' },
        description: {
          vi: 'Tạo website từ mẫu chuẩn, cài máy chủ, kết nối an toàn, giám sát, sao lưu và trỏ tên miền.',
          en: 'We create the site from a proven template and set up the server, secure connection, monitoring, backups and your domain.',
        },
      },
      {
        stepNumber: '03',
        title: { vi: 'Bàn giao', en: 'Handover' },
        description: {
          vi: 'Bạn duyệt trên bản thử, rồi đưa lên chính thức. Chúng tôi giao tài khoản quản trị nội dung và hướng dẫn ngắn.',
          en: 'You review a test version and then we go live. You receive a content account and a short guide.',
        },
      },
      {
        stepNumber: '04',
        title: { vi: 'Vận hành và hỗ trợ', en: 'Running and support' },
        description: {
          vi: 'Giám sát và cảnh báo tự động, sao lưu theo lịch, vá bảo mật hằng tháng. Mọi yêu cầu đi qua một kênh duy nhất.',
          en: 'Automatic monitoring and alerts, scheduled backups and monthly security patches. Every request goes through a single channel.',
        },
      },
      {
        stepNumber: '05',
        title: { vi: 'Kết thúc hợp đồng', en: 'Ending the contract' },
        description: {
          vi: 'Nếu dừng dịch vụ, bạn nhận lại mã nguồn, bản sao lưu dữ liệu và quyền quản lý tên miền.',
          en: 'If you stop the service, you receive your source code, a backup of your data and control of your domain.',
        },
      },
    ],
  },
});

export const homeCta = defineSection({
  key: 'cta',
  label: 'Kêu gọi hành động',
  fields: {
    heading: field.text({ max: 150 }),
    subheading: field.textarea({ max: 300 }),
    primaryCta: field.link(),
    secondaryCta: field.link(),
  },
  defaults: {
    heading: { vi: 'Bắt đầu với website của bạn', en: 'Start with your website' },
    subheading: {
      vi: 'Cho chúng tôi biết bạn là ai và cần gì, chúng tôi sẽ gợi ý gói phù hợp.',
      en: 'Tell us who you are and what you need, and we will suggest the right package.',
    },
    primaryCta: {
      label: { vi: 'Liên hệ tư vấn', en: 'Talk to us' },
      url: '/contact',
      target: '_self',
    },
    secondaryCta: {
      label: { vi: 'Xem gói dịch vụ', en: 'See our packages' },
      url: '/packages',
      target: '_self',
    },
  },
});

export const homePage = {
  key: 'home',
  title: { vi: 'Trang chủ', en: 'Home' },
  sections: [
    homeHero,
    homeValues,
    homeServicesIntro,
    homeProductsIntro,
    homeAudiences,
    homePackagesIntro,
    homeProcess,
    homeCta,
  ],
  seo: {
    title: {
      vi: 'Dev House Software — Website trọn gói, an toàn và ổn định',
      en: 'Dev House Software — Complete, safe and stable websites',
    },
    description: {
      vi: 'Dev House dựng website từ mẫu chuẩn, lo máy chủ, tên miền, bảo mật và xử lý sự cố. Bạn chỉ cần tập trung kinh doanh.',
      en: 'Dev House builds your website from proven templates and takes care of hosting, domain, security and fixes, so you can focus on your business.',
    },
  },
};
