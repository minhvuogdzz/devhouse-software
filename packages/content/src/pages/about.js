import { ICON_KEYS, makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

/*
 * The About page is about the company: who we are, what we do and how we work.
 * It deliberately does not introduce the leadership team.
 */

const titleAndText = withIcon =>
  field.list({
    of: field.group({
      fields: {
        ...(withIcon ? { icon: field.select({ options: ICON_KEYS }) } : {}),
        title: field.text({ max: 80 }),
        description: field.textarea({ max: 400 }),
      },
    }),
  });

export const aboutHero = defineSection({
  key: 'hero',
  label: 'Hero Giới thiệu',
  summary: 'Tiêu đề và đoạn giới thiệu ngắn ở đầu trang.',
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
      vi: 'Devhouse Software dựng website, vận hành máy chủ, lo tên miền và bảo mật cho cửa hàng và doanh nghiệp nhỏ, từ Việt Nam.',
      en: 'Devhouse Software builds websites, runs servers and looks after domains and security for shops and small businesses, starting in Vietnam.',
    },
  },
});

export const aboutCompany = defineSection({
  key: 'company',
  label: 'Câu chuyện công ty',
  summary: 'Câu chuyện và phần giới thiệu về công ty.',
  fields: {
    heading: field.text({ max: 120 }),
    intro: field.textarea({ max: 600 }),
    paragraphs: field.list({ of: field.textarea({ max: 800 }), max: 8 }),
    groupNote: field.textarea({ max: 400 }),
  },
  defaults: {
    heading: { vi: 'Về Devhouse Software', en: 'About Devhouse Software' },
    intro: {
      vi: 'Devhouse Software là công ty công nghệ có trụ sở tại Hà Nội. Chúng tôi bán trọn gói website, máy chủ, tên miền và bảo mật, rồi đồng hành vận hành lâu dài để bạn không phải lo phần kỹ thuật.',
      en: 'Devhouse Software is a technology company based in Hanoi. We offer websites, hosting, domains and security as one package, and keep running them for you so you never have to deal with the technical side.',
    },
    paragraphs: [
      {
        vi: 'Nhiều cửa hàng, quán ăn và sinh viên cần một website nhưng không có thời gian, cũng không muốn tìm hiểu về máy chủ, tên miền hay bảo mật. Devhouse Software làm thay phần việc đó.',
        en: 'Many shops, cafés and students need a website but have no time, and no wish, to learn about servers, domains or security. Devhouse Software does that work for them.',
      },
      {
        vi: 'Chúng tôi dựng website từ những mẫu đã được kiểm chứng, cho chạy trên máy chủ đám mây an toàn, rồi ở lại vận hành: theo dõi, sao lưu, cập nhật bảo mật và xử lý sự cố. Bạn chỉ làm việc với một đầu mối cho cả website, máy chủ và tên miền.',
        en: 'We build websites from templates that have already been proven, run them on safe cloud servers and then stay to look after them: monitoring, backups, security updates and fixing problems. You deal with a single contact for your website, hosting and domain.',
      },
      {
        vi: 'Chúng tôi bắt đầu với sinh viên, cửa hàng và quán ăn nhỏ tại Việt Nam, sau đó là doanh nghiệp nhỏ và startup. Mỗi khách hàng đi qua cùng một quy trình, nên bạn biết trước mỗi bước sẽ diễn ra thế nào.',
        en: 'We start with students, shops and small cafés in Vietnam, followed by small businesses and startups. Every customer follows the same process, so you know in advance what each step will look like.',
      },
    ],
    groupNote: {
      vi: 'Devhouse Software là thành viên của Devhouse Group, phụ trách mảng website và hạ tầng cho khách hàng.',
      en: 'Devhouse Software is a member of Devhouse Group and looks after websites and hosting for clients.',
    },
  },
});

export const aboutGallery = defineSection({
  key: 'gallery',
  label: 'Ảnh về công ty (slide)',
  summary: 'Ảnh về công ty chạy dạng slide, không giới hạn số ảnh. Chỉ hiện khi đã tải ảnh lên.',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    images: field.gallery(),
    display: field.display(),
  },
  defaults: {
    heading: { vi: 'Hình ảnh', en: 'Pictures' },
    subheading: { vi: '', en: '' },
    // No pictures are made up: the section stays hidden until an admin uploads some.
    images: [],
    display: makeDisplay({
      layout: 'slide',
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      slide: { motion: 'step', autoplay: true, interval: 4, dots: 'slide', arrows: true },
    }),
  },
});

export const aboutVision = defineSection({
  key: 'vision',
  label: 'Tầm nhìn và sứ mệnh',
  summary: 'Tầm nhìn và sứ mệnh của công ty.',
  fields: {
    heading: field.text({ max: 120 }),
    items: titleAndText(true),
    display: field.display(),
  },
  defaults: {
    heading: { vi: 'Điều chúng tôi hướng tới', en: 'What we aim for' },
    items: [
      {
        icon: 'rocket',
        title: { vi: 'Tầm nhìn', en: 'Vision' },
        description: {
          vi: 'Trở thành đơn vị lo trọn phần kỹ thuật website cho khách hàng nhỏ, từ Việt Nam ra thị trường quốc tế.',
          en: 'To be the team that takes care of the whole technical side of websites for small customers, from Vietnam to the international market.',
        },
      },
      {
        icon: 'heart',
        title: { vi: 'Sứ mệnh', en: 'Mission' },
        description: {
          vi: 'Để bạn chỉ cần tập trung kinh doanh: website, tên miền, bảo mật và sự cố đã có Devhouse đảm nhận.',
          en: 'So that you only need to focus on your business: your website, domain, security and any problems are taken care of by Devhouse.',
        },
      },
    ],
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 2 } }),
  },
});

export const aboutOfferings = defineSection({
  key: 'offerings',
  label: 'Chúng tôi làm gì',
  summary: 'Những việc công ty làm cho khách hàng.',
  fields: {
    heading: field.text({ max: 120 }),
    items: field.list({
      of: field.group({
        fields: {
          icon: field.select({ options: ICON_KEYS }),
          title: field.text({ max: 80 }),
          description: field.textarea({ max: 400 }),
          path: field.string({ max: 200 }),
        },
      }),
    }),
    display: field.display(),
  },
  defaults: {
    heading: { vi: 'Bốn nhóm dịch vụ của chúng tôi', en: 'Our four services' },
    items: [
      {
        icon: 'layout',
        title: { vi: 'Thiết kế website', en: 'Website design' },
        description: {
          vi: 'Website giới thiệu, landing page và web bán hàng nhỏ, dựng từ mẫu chuẩn.',
          en: 'Business sites, landing pages and small online shops, built from proven templates.',
        },
        path: '/services/thiet-ke-website',
      },
      {
        icon: 'server',
        title: { vi: 'Máy chủ và hạ tầng đám mây', en: 'Cloud hosting' },
        description: {
          vi: 'Website chạy trên máy chủ an toàn, có giám sát, sao lưu và cập nhật bảo mật.',
          en: 'Your site runs on secure servers with monitoring, backups and security updates.',
        },
        path: '/services/may-chu-va-ha-tang-dam-may',
      },
      {
        icon: 'link',
        title: { vi: 'Tên miền và DNS', en: 'Domain and DNS' },
        description: {
          vi: 'Đăng ký, gia hạn và cấu hình tên miền, email theo tên miền. Tên miền đứng tên bạn.',
          en: 'We register, renew and configure your domain and email. The domain stays in your name.',
        },
        path: '/services/ten-mien-va-dns',
      },
      {
        icon: 'shield',
        title: { vi: 'Bảo mật và hỗ trợ', en: 'Security and support' },
        description: {
          vi: 'Tường lửa, xử lý sự cố và chỉnh sửa nhỏ trong số giờ hỗ trợ của gói.',
          en: 'A firewall, fixing problems and small edits within the support hours of your package.',
        },
        path: '/services/bao-mat-va-ho-tro',
      },
    ],
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
  },
});

export const aboutValues = defineSection({
  key: 'values',
  label: 'Bốn giá trị cam kết',
  summary: 'Các giá trị cam kết của công ty.',
  fields: {
    heading: field.text({ max: 120 }),
    items: titleAndText(true),
    display: field.display(),
  },
  defaults: {
    heading: {
      vi: 'Bốn giá trị chúng tôi cam kết với khách hàng',
      en: 'The four values we promise our customers',
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
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
  },
});

export const aboutServiceTerms = defineSection({
  key: 'serviceTerms',
  label: 'Điều khoản dịch vụ (tóm tắt)',
  summary: 'Tóm tắt các điều khoản dịch vụ.',
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
    display: field.display(),
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
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 2 } }),
  },
});

export const aboutCta = defineSection({
  key: 'cta',
  label: 'Kêu gọi hành động',
  summary: 'Khung cuối trang mời khách liên hệ.',
  fields: {
    heading: field.text({ max: 150 }),
    subheading: field.textarea({ max: 300 }),
    button: field.link(),
  },
  defaults: {
    heading: { vi: 'Bạn muốn có website của mình?', en: 'Want a website of your own?' },
    subheading: {
      vi: 'Cho chúng tôi biết nhu cầu, chúng tôi sẽ gợi ý gói phù hợp.',
      en: 'Tell us what you need and we will suggest the right package.',
    },
    button: {
      label: { vi: 'Liên hệ tư vấn', en: 'Talk to us' },
      url: '/contact',
      target: '_self',
    },
  },
});

export const aboutPage = {
  // The admin shows every section with a switch (on/off) and its display settings
  overview: true,
  key: 'about',
  title: { vi: 'Về Devhouse', en: 'About Devhouse' },
  sections: [
    aboutHero,
    aboutCompany,
    aboutGallery,
    aboutVision,
    aboutOfferings,
    aboutValues,
    aboutServiceTerms,
    aboutCta,
  ],
  seo: {
    title: {
      vi: 'Về chúng tôi — Devhouse Software',
      en: 'About us — Devhouse Software',
    },
    description: {
      vi: 'Devhouse Software là ai, làm gì, và cam kết gì với khách hàng: an toàn, ổn định, đơn giản và minh bạch.',
      en: 'Who Devhouse Software is, what we do and what we promise our customers: safe, stable, simple and transparent.',
    },
  },
};
