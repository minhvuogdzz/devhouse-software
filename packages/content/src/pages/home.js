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
  summary:
    'Khối đầu tiên của trang: tiêu đề lớn, đoạn giới thiệu, hai nút và vài dòng điểm nhấn. Nên để bật, vì đây là tiêu đề chính của trang.',
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
      vi: 'Devhouse dựng website từ mẫu chuẩn, chạy trên máy chủ đám mây, lo tên miền, bảo mật và xử lý sự cố. Bạn chỉ cần tập trung vào việc kinh doanh.',
      en: 'Devhouse builds your website from proven templates, runs it on cloud servers and takes care of your domain, security and fixes. You focus on your business.',
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
  summary: 'Các thẻ cam kết của công ty (an toàn, ổn định, đơn giản, minh bạch).',
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
  label: 'Mục Dịch vụ nổi bật trên trang chủ (/services)',
  summary:
    'Các nhóm dịch vụ nổi bật (/services), lấy từ mục Dịch vụ. Muốn đổi nội dung từng thẻ, vào mục Dịch vụ.',
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
  label: 'Mục Mẫu website nổi bật trên trang chủ (/products)',
  summary:
    'Các mẫu website (/products), lấy từ mục Mẫu website (ưu tiên mẫu được đánh dấu Nổi bật).',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({
      layout: 'slide',
      columns: { mobile: 1, tablet: 2, desktop: 4 },
      slide: { motion: 'step', autoplay: true, interval: 4, dots: 'progress', arrows: true },
    }),
    heading: { vi: 'Mẫu website có sẵn', en: 'Ready-made website templates' },
    subheading: {
      vi: 'Xem thử ngay trên trang này, chọn mẫu phù hợp rồi để chúng tôi triển khai cho bạn.',
      en: 'Try them right here, pick the one you like and we will set it up for you.',
    },
  },
});

export const homeProjectsIntro = defineSection({
  key: 'projectsIntro',
  label: 'Mục Dự án nổi bật trên trang chủ (/projects)',
  summary:
    'Các dự án tiêu biểu (/projects), lấy từ mục Dự án (ưu tiên dự án được đánh dấu Dự án nổi bật).',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    visible: true,
    display: makeDisplay({
      layout: 'grid',
      columns: { mobile: 1, tablet: 2, desktop: 4 },
      showMore: 'expand',
    }),
    heading: { vi: 'Dự án tiêu biểu đã triển khai', en: 'Featured client projects' },
    subheading: {
      vi: 'Các hệ thống và website thực tế đã được Devhouse xây dựng và vận hành cho khách hàng.',
      en: 'Real-world websites and systems built and operated by Devhouse for our clients.',
    },
  },
});

export const homeAudiences = defineSection({
  key: 'audiences',
  label: 'Dành cho ai',
  summary: 'Các nhóm khách hàng phù hợp với dịch vụ.',
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
  label: 'Mục Gói dịch vụ nổi bật trên trang chủ (/packages)',
  summary: 'Các gói dịch vụ (/packages), lấy từ mục Bảng Giá & Gói Cước.',
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

export const homeSolutionsIntro = defineSection({
  key: 'solutionsIntro',
  label: 'Mục Giải pháp nổi bật trên trang chủ (/solutions)',
  summary:
    'Các gói giải pháp phần mềm (/solutions), lấy từ mục Giải pháp (ưu tiên giải pháp Nổi bật).',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    visible: false,
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
    heading: { vi: 'Giải pháp phần mềm chuyên biệt', en: 'Specialized software solutions' },
    subheading: {
      vi: 'Các gói giải pháp được thiết kế sẵn giúp rút ngắn thời gian triển khai và tối ưu chi phí vận hành.',
      en: 'Pre-architected solution packages tailored to reduce time-to-market and operational risk.',
    },
  },
});

export const homeTechnologiesIntro = defineSection({
  key: 'technologiesIntro',
  label: 'Mục Công nghệ nổi bật trên trang chủ (/technologies)',
  summary:
    'Các công nghệ nền tảng (/technologies), lấy từ mục Công nghệ (ưu tiên công nghệ Nổi bật).',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    visible: false,
    display: makeDisplay({ layout: 'grid', columns: { mobile: 2, tablet: 3, desktop: 4 } }),
    heading: { vi: 'Nền tảng công nghệ tin cậy', en: 'Trusted technology stack' },
    subheading: {
      vi: 'Chúng tôi sử dụng các công nghệ trưởng thành, bảo mật cao và dễ bảo trì lâu dài.',
      en: 'We build on mature, secure and maintainable technologies.',
    },
  },
});

export const homeProcess = defineSection({
  key: 'process',
  label: 'Quy trình làm việc (/#process)',
  summary:
    'Các bước làm việc (/#process), từ lúc tư vấn đến khi vận hành. Dạng lưới hoặc danh sách hiện thành dòng thời gian.',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    steps: field.list({
      of: field.group({
        fields: {
          stepNumber: field.string({ max: 4 }),
          icon: field.select({ options: ICON_KEYS }),
          title: field.text({ max: 80 }),
          duration: field.text({ max: 30 }),
          description: field.textarea({ max: 300 }),
        },
      }),
    }),
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 3, desktop: 6 } }),
    heading: { vi: 'Sáu bước để có website của bạn', en: 'Six steps to your website' },
    subheading: {
      vi: 'Gói Cửa hàng: khoảng 5–7 ngày làm việc từ khi nhận đủ nội dung.',
      en: 'Shop package: about 5–7 working days once we have your content.',
    },
    steps: [
      {
        stepNumber: '01',
        icon: 'headset',
        title: { vi: 'Tư vấn miễn phí', en: 'Free consultation' },
        duration: { vi: '15–30 phút', en: '15–30 minutes' },
        description: {
          vi: 'Nhận đề xuất gói và máy chủ trong 24 giờ.',
          en: 'A proposed package and server within 24 hours.',
        },
      },
      {
        stepNumber: '02',
        icon: 'file-text',
        title: { vi: 'Báo giá & hợp đồng', en: 'Quote & contract' },
        duration: { vi: '1–2 ngày', en: '1–2 days' },
        description: { vi: 'Giá rõ ràng, trả trước 50%.', en: 'Clear pricing, 50% up front.' },
      },
      {
        stepNumber: '03',
        icon: 'server',
        title: { vi: 'Tên miền & máy chủ', en: 'Domain & server' },
        duration: { vi: '1–2 ngày', en: '1–2 days' },
        description: {
          vi: 'Đứng tên bạn, có HTTPS và sao lưu.',
          en: 'In your name, with HTTPS and backups.',
        },
      },
      {
        stepNumber: '04',
        icon: 'layout',
        title: { vi: 'Dựng bản thử', en: 'Test version' },
        duration: { vi: '3–5 ngày', en: '3–5 days' },
        description: { vi: 'Xem trước, chỉnh sửa 2 vòng.', en: 'Preview it, 2 rounds of changes.' },
      },
      {
        stepNumber: '05',
        icon: 'rocket',
        title: { vi: 'Bàn giao', en: 'Handover' },
        duration: { vi: '1 ngày', en: '1 day' },
        description: {
          vi: 'Web chạy thật, tài khoản quản trị. Trả 50% còn lại.',
          en: 'Site goes live, admin account. Pay the other 50%.',
        },
      },
      {
        stepNumber: '06',
        icon: 'shield',
        title: { vi: 'Vận hành', en: 'Running' },
        duration: { vi: 'Suốt hợp đồng', en: 'Ongoing' },
        description: {
          vi: 'Giám sát 24/7, sao lưu, vá bảo mật hằng tháng.',
          en: '24/7 monitoring, backups, monthly security patches.',
        },
      },
    ],
  },
});

export const homeAboutIntro = defineSection({
  key: 'aboutIntro',
  label: 'Mục Về Devhouse nổi bật trên trang chủ (/about)',
  summary:
    'Khối giới thiệu tóm tắt về công ty (/about) trên trang chủ kèm các điểm mạnh và nút dẫn sang trang Về Devhouse.',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 400 }),
    items: cardList(true),
    display: field.display(),
  },
  defaults: {
    visible: false,
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
    heading: {
      vi: 'Về Devhouse Software',
      en: 'About Devhouse Software',
    },
    subheading: {
      vi: 'Đội ngũ kỹ thuật đồng hành trọn gói từ thiết kế website, hạ tầng đám mây đến vận hành và bảo mật lâu dài.',
      en: 'Your dedicated technical partner for websites, cloud hosting, security and long-term operations.',
    },
    items: [
      {
        icon: 'building',
        title: { vi: 'Trọn gói một đầu mối', en: 'Single point of contact' },
        description: {
          vi: 'Từ tên miền, máy chủ, giao diện đến bảo mật định kỳ đều do Devhouse trực tiếp đảm nhận.',
          en: 'From domain and hosting to design and regular security updates, handled by one team.',
        },
      },
      {
        icon: 'shield',
        title: { vi: 'Vận hành an toàn 24/7', en: '24/7 safe operations' },
        description: {
          vi: 'Theo dõi hoạt động liên tục, sao lưu tự động và hỗ trợ ngay khi phát sinh sự cố.',
          en: 'Continuous monitoring, automated backups and immediate support whenever issues arise.',
        },
      },
      {
        icon: 'file-text',
        title: { vi: 'Hợp đồng & chi phí rõ ràng', en: 'Clear contracts & pricing' },
        description: {
          vi: 'Báo giá minh bạch trước khi triển khai, quyền sở hữu tên miền và dữ liệu thuộc về khách hàng.',
          en: 'Transparent quotes upfront, with full ownership of your domain and data.',
        },
      },
    ],
  },
});

export const homeBlogIntro = defineSection({
  key: 'blogIntro',
  label: 'Mục Bài viết / Tin tức nổi bật trên trang chủ (/blog)',
  summary:
    'Các bài viết chia sẻ kinh nghiệm và tin tức (/blog), lấy từ mục Bài viết (ưu tiên bài viết Nổi bật).',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    visible: false,
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
    heading: { vi: 'Góc nhìn & Chia sẻ', en: 'Insights & Articles' },
    subheading: {
      vi: 'Kinh nghiệm xây dựng, vận hành và bảo mật website thực tế cho doanh nghiệp.',
      en: 'Practical guides on building, operating and securing business websites.',
    },
  },
});

export const homeCareersIntro = defineSection({
  key: 'careersIntro',
  label: 'Mục Tuyển dụng nổi bật trên trang chủ (/careers)',
  summary:
    'Khối giới thiệu môi trường làm việc và cơ hội nghề nghiệp (/careers) trên trang chủ.',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    items: cardList(true),
    display: field.display(),
  },
  defaults: {
    visible: false,
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
    heading: { vi: 'Cơ hội nghề nghiệp tại Devhouse', en: 'Careers at Devhouse' },
    subheading: {
      vi: 'Cùng xây dựng những sản phẩm công nghệ thực tế, ổn định và mang lại giá trị lâu dài cho khách hàng.',
      en: 'Join our team to build dependable, high-impact software products for businesses.',
    },
    items: [
      {
        icon: 'rocket',
        title: { vi: 'Dự án thực chất', en: 'Real-world impact' },
        description: {
          vi: 'Tham gia trực tiếp vào các hệ thống đang phục vụ khách hàng thật mỗi ngày.',
          en: 'Work directly on production systems serving real businesses every day.',
        },
      },
      {
        icon: 'users',
        title: { vi: 'Văn hóa tôn trọng & tự chủ', en: 'Autonomy & respect' },
        description: {
          vi: 'Đánh giá dựa trên kết quả bàn giao, quy trình làm việc rõ ràng và hỗ trợ lẫn nhau.',
          en: 'Evaluated on real delivery outcomes with clear processes and strong team support.',
        },
      },
      {
        icon: 'check',
        title: { vi: 'Đãi ngộ xứng đáng', en: 'Fair compensation' },
        description: {
          vi: 'Thu nhập cạnh tranh, xét duyệt định kỳ và đầy đủ quyền lợi bảo hiểm, phúc lợi.',
          en: 'Competitive pay, regular reviews and full benefits.',
        },
      },
    ],
  },
});

export const homeCustomPathsIntro = defineSection({
  key: 'customPathsIntro',
  label: 'Mục Các trang /path tùy chỉnh bật nổi bật trên trang chủ',
  summary:
    'Cho phép bật hiển thị nổi bật thêm bất kỳ trang nào có đường dẫn /path trên thanh Menu điều hướng.',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    items: field.list({
      of: field.group({
        fields: {
          icon: field.select({ options: ICON_KEYS }),
          title: field.text({ max: 80 }),
          description: field.textarea({ max: 300 }),
          path: field.string({ max: 200 }),
        },
      }),
    }),
    display: field.display(),
  },
  defaults: {
    visible: false,
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
    heading: { vi: 'Khám phá thêm trên Devhouse', en: 'Explore more on Devhouse' },
    subheading: {
      vi: 'Truy cập nhanh các chuyên mục và dịch vụ trọng tâm.',
      en: 'Quick access to our key sections and services.',
    },
    items: [
      {
        icon: 'layout',
        title: { vi: 'Thiết kế website & Shopify', en: 'Website & Shopify Design' },
        description: {
          vi: 'Dựng website chuẩn SEO, giao diện hiện đại và dễ quản trị.',
          en: 'SEO-ready websites with modern design and easy management.',
        },
        path: '/services/thiet-ke-website',
      },
      {
        icon: 'server',
        title: { vi: 'Máy chủ & Hạ tầng Cloud', en: 'Cloud & Server Hosting' },
        description: {
          vi: 'Vận hành ổn định trên hạ tầng đám mây với sao lưu tự động.',
          en: 'Reliable cloud hosting with automated daily backups.',
        },
        path: '/services/may-chu-va-ha-tang-dam-may',
      },
      {
        icon: 'link',
        title: { vi: 'Tên miền & DNS', en: 'Domain & DNS' },
        description: {
          vi: 'Đăng ký và quản lý tên miền chính chủ, cấu hình SSL/HTTPS tự động.',
          en: 'Domain registration in your name with automatic SSL/HTTPS.',
        },
        path: '/services/ten-mien-va-dns',
      },
      {
        icon: 'shield',
        title: { vi: 'Bảo mật & Hỗ trợ định kỳ', en: 'Security & Support' },
        description: {
          vi: 'Giám sát 24/7, tường lửa và xử lý sự cố kỹ thuật nhanh chóng.',
          en: '24/7 monitoring, firewall protection and rapid issue resolution.',
        },
        path: '/services/bao-mat-va-ho-tro',
      },
    ],
  },
});

export const homeCta = defineSection({
  key: 'cta',
  label: 'Kêu gọi hành động / Liên hệ (/contact)',
  summary: 'Khung cuối trang mời khách liên hệ (/contact) hoặc xem gói dịch vụ.',
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
  // The admin shows every section with a switch (on/off) and its display settings
  overview: true,
  key: 'home',
  title: { vi: 'Trang chủ', en: 'Home' },
  sections: [
    homeHero,
    homeValues,
    homeServicesIntro,
    homeProductsIntro,
    homeProjectsIntro,
    homeAudiences,
    homePackagesIntro,
    homeSolutionsIntro,
    homeTechnologiesIntro,
    homeProcess,
    homeAboutIntro,
    homeBlogIntro,
    homeCareersIntro,
    homeCustomPathsIntro,
    homeCta,
  ],
  seo: {
    title: {
      vi: 'Devhouse Software — Website trọn gói, an toàn và ổn định',
      en: 'Devhouse Software — Complete, safe and stable websites',
    },
    description: {
      vi: 'Devhouse dựng website từ mẫu chuẩn, lo máy chủ, tên miền, bảo mật và xử lý sự cố. Bạn chỉ cần tập trung kinh doanh.',
      en: 'Devhouse builds your website from proven templates and takes care of hosting, domain, security and fixes, so you can focus on your business.',
    },
  },
};
