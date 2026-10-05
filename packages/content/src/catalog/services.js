/**
 * The service groups Dev House sells (see the company direction document).
 * Prices live in packages, not here. Everything is plain language, in Vietnamese and English.
 */
const PUBLISHED_AT = new Date('2026-01-01T00:00:00.000Z');

const serviceGroups = [
  {
    name: { vi: 'Thiết kế website', en: 'Website design' },
    slug: { vi: 'thiet-ke-website', en: 'website-design' },
    shortDescription: {
      vi: 'Website giới thiệu, landing page và web bán hàng nhỏ, dựng từ mẫu chuẩn để nhanh và tiết kiệm.',
      en: 'Business sites, landing pages and small online shops, built from proven templates so they are quick and affordable.',
    },
    description: {
      vi: 'Chúng tôi dựng website cho bạn từ những mẫu đã được kiểm chứng, nên thời gian làm ngắn và chi phí hợp lý. Có thể là website giới thiệu doanh nghiệp, landing page, web bán hàng nhỏ (kể cả trên Shopify) hoặc web cho đồ án sinh viên.',
      en: 'We build your website from templates that have already been proven, so it is ready sooner and costs less. It can be a business website, a landing page, a small online shop (including on Shopify) or a website for a student project.',
    },
    icon: 'layout',
    billing: 'one_time',
    order: 1,
    status: 'published',
    publishedAt: PUBLISHED_AT,
    features: [
      {
        title: { vi: 'Dựng từ mẫu chuẩn', en: 'Built from proven templates' },
        description: {
          vi: 'Chọn một mẫu bạn thích, chúng tôi chỉnh theo thương hiệu của bạn.',
          en: 'Pick a template you like and we adapt it to your brand.',
        },
      },
      {
        title: { vi: 'Web bán hàng nhỏ và Shopify', en: 'Small shops and Shopify' },
        description: {
          vi: 'Bán sản phẩm trực tuyến với trang thanh toán và quản lý đơn hàng.',
          en: 'Sell products online with checkout and order management.',
        },
      },
      {
        title: { vi: 'Website giới thiệu và landing page', en: 'Business sites and landing pages' },
        description: {
          vi: 'Giới thiệu doanh nghiệp, dịch vụ hoặc một chiến dịch trên một trang gọn gàng.',
          en: 'Present your business, services or a campaign on a clean page.',
        },
      },
      {
        title: { vi: 'Xem thử trước khi đưa lên chính thức', en: 'Review before it goes live' },
        description: {
          vi: 'Bạn duyệt trên bản thử, hài lòng rồi mới đưa lên chính thức.',
          en: 'You review a test version and we only go live once you are happy.',
        },
      },
    ],
    faqs: [
      {
        question: { vi: 'Tôi có cần biết kỹ thuật không?', en: 'Do I need technical knowledge?' },
        answer: {
          vi: 'Không. Chúng tôi lo phần kỹ thuật, bạn chỉ cần cho biết nội dung và mong muốn.',
          en: 'No. We take care of the technical side. You only tell us what you need.',
        },
      },
      {
        question: { vi: 'Thanh toán như thế nào?', en: 'How do I pay?' },
        answer: {
          vi: 'Khi ký hợp đồng, bạn trả trước tối thiểu 50% phí cài đặt. Phần còn lại trả khi bàn giao.',
          en: 'When the contract is signed you pay at least 50% of the setup fee. The rest is paid on delivery.',
        },
      },
    ],
    seo: {
      title: {
        vi: 'Thiết kế website từ mẫu chuẩn — Dev House Software',
        en: 'Website design from proven templates — Dev House Software',
      },
      description: {
        vi: 'Website giới thiệu, landing page và web bán hàng nhỏ, dựng nhanh và giá hợp lý.',
        en: 'Business sites, landing pages and small online shops, built quickly at a fair price.',
      },
    },
  },
  {
    name: { vi: 'Máy chủ và hạ tầng đám mây', en: 'Cloud hosting' },
    slug: { vi: 'may-chu-va-ha-tang-dam-may', en: 'cloud-hosting' },
    shortDescription: {
      vi: 'Website chạy trên máy chủ đám mây an toàn, được giám sát, sao lưu và cập nhật thường xuyên.',
      en: 'Your website runs on secure cloud servers that are monitored, backed up and kept up to date.',
    },
    description: {
      vi: 'Website của bạn chạy trên máy chủ đám mây, không đặt trên máy tính văn phòng nên không bị chậm hay ngừng khi mạng văn phòng có vấn đề. Chúng tôi lo kết nối an toàn, giám sát, sao lưu và cập nhật bảo mật.',
      en: 'Your website runs on cloud servers instead of an office computer, so it does not slow down or stop when the office network has problems. We handle the secure connection, monitoring, backups and security updates.',
    },
    icon: 'server',
    billing: 'recurring',
    order: 2,
    status: 'published',
    publishedAt: PUBLISHED_AT,
    features: [
      {
        title: { vi: 'Kết nối an toàn (HTTPS)', en: 'Secure connection (HTTPS)' },
        description: {
          vi: 'Mọi website đều dùng kết nối mã hoá, hiện ổ khoá an toàn trên trình duyệt.',
          en: 'Every website uses an encrypted connection and shows the secure padlock.',
        },
      },
      {
        title: { vi: 'Giám sát và cảnh báo', en: 'Monitoring and alerts' },
        description: {
          vi: 'Hệ thống tự theo dõi website và báo ngay khi có sự cố.',
          en: 'The system watches your website and raises an alert as soon as something goes wrong.',
        },
      },
      {
        title: { vi: 'Sao lưu tự động', en: 'Automatic backups' },
        description: {
          vi: 'Dữ liệu được sao lưu theo lịch để khôi phục khi cần.',
          en: 'Your data is backed up on a schedule so it can be restored when needed.',
        },
      },
      {
        title: { vi: 'Cập nhật bảo mật định kỳ', en: 'Regular security updates' },
        description: {
          vi: 'Chúng tôi cập nhật phần mềm nền để vá các lỗ hổng bảo mật đã biết.',
          en: 'We keep the underlying software up to date to close known security holes.',
        },
      },
    ],
    faqs: [
      {
        question: { vi: 'Dữ liệu có được sao lưu không?', en: 'Is my data backed up?' },
        answer: {
          vi: 'Có. Tần suất sao lưu và số ngày giữ bản sao được ghi rõ trong hợp đồng của từng gói.',
          en: 'Yes. How often backups run and how long they are kept is written into the contract of each package.',
        },
      },
    ],
    seo: {
      title: {
        vi: 'Máy chủ và hạ tầng đám mây cho website — Dev House Software',
        en: 'Cloud hosting for your website — Dev House Software',
      },
      description: {
        vi: 'Máy chủ đám mây an toàn, có giám sát, sao lưu và cập nhật bảo mật định kỳ.',
        en: 'Secure cloud servers with monitoring, backups and regular security updates.',
      },
    },
  },
  {
    name: { vi: 'Tên miền và DNS', en: 'Domain and DNS' },
    slug: { vi: 'ten-mien-va-dns', en: 'domain-and-dns' },
    shortDescription: {
      vi: 'Đăng ký, gia hạn tên miền và cấu hình để website, email của bạn hoạt động đúng. Tên miền luôn đứng tên bạn.',
      en: 'We register and renew your domain and set it up so your website and email work properly. The domain always stays in your name.',
    },
    description: {
      vi: 'Chúng tôi đăng ký và gia hạn tên miền, cấu hình DNS qua Cloudflare và tạo email theo tên miền của bạn. Tên miền đứng tên bạn, nên bạn luôn toàn quyền khi cần chuyển đi nơi khác.',
      en: 'We register and renew your domain, set up DNS through Cloudflare and create email addresses on your domain. The domain is registered in your name, so you keep full control if you ever want to move.',
    },
    icon: 'link',
    billing: 'yearly',
    order: 3,
    status: 'published',
    publishedAt: PUBLISHED_AT,
    features: [
      {
        title: { vi: 'Đăng ký và gia hạn', en: 'Registration and renewal' },
        description: {
          vi: 'Chúng tôi nhắc và gia hạn trước ngày hết hạn để website không bị gián đoạn.',
          en: 'We renew before the expiry date so your website never goes offline.',
        },
      },
      {
        title: { vi: 'Cấu hình DNS qua Cloudflare', en: 'DNS through Cloudflare' },
        description: {
          vi: 'Trỏ tên miền về đúng website và thêm lớp bảo vệ cơ bản.',
          en: 'We point the domain to your website and add a basic layer of protection.',
        },
      },
      {
        title: { vi: 'Email theo tên miền', en: 'Email on your domain' },
        description: {
          vi: 'Địa chỉ email mang tên doanh nghiệp, ví dụ ten@congty.com.',
          en: 'Email addresses with your own business name, such as name@yourcompany.com.',
        },
      },
      {
        title: { vi: 'Tên miền đứng tên bạn', en: 'The domain is yours' },
        description: {
          vi: 'Chủ sở hữu là bạn, không phải chúng tôi.',
          en: 'You are the owner, not us.',
        },
      },
    ],
    faqs: [
      {
        question: { vi: 'Phí tên miền thu khi nào?', en: 'When is the domain fee charged?' },
        answer: {
          vi: 'Thu mỗi năm, trước ngày tên miền hết hạn.',
          en: 'Once a year, before the domain expires.',
        },
      },
    ],
    seo: {
      title: {
        vi: 'Tên miền và DNS — Dev House Software',
        en: 'Domain and DNS — Dev House Software',
      },
      description: {
        vi: 'Đăng ký, gia hạn tên miền, cấu hình DNS và email theo tên miền.',
        en: 'Domain registration and renewal, DNS setup and email on your own domain.',
      },
    },
  },
  {
    name: { vi: 'Bảo mật và hỗ trợ', en: 'Security and support' },
    slug: { vi: 'bao-mat-va-ho-tro', en: 'security-and-support' },
    shortDescription: {
      vi: 'Bảo vệ website khỏi tấn công cơ bản, xử lý sự cố và chỉnh sửa nhỏ trong số giờ hỗ trợ của gói.',
      en: 'Protection against common attacks, fixing problems and small edits within the support hours of your package.',
    },
    description: {
      vi: 'Chúng tôi bật tường lửa cho website, chống các đợt tấn công làm quá tải ở mức cơ bản, vá bảo mật mỗi tháng và có người xử lý khi web gặp sự cố. Mọi yêu cầu hỗ trợ đi qua một kênh duy nhất và được ghi lại để tính giờ minh bạch.',
      en: 'We put a firewall in front of your website, protect it against common overload attacks, apply security patches every month and have someone ready when something breaks. Every support request goes through a single channel and is logged so hours are counted fairly.',
    },
    icon: 'shield',
    billing: 'recurring',
    order: 4,
    status: 'published',
    publishedAt: PUBLISHED_AT,
    features: [
      {
        title: {
          vi: 'Tường lửa và chống quá tải cơ bản',
          en: 'Firewall and basic overload protection',
        },
        description: {
          vi: 'Chặn các truy cập độc hại và giảm thiểu tấn công làm web ngừng hoạt động.',
          en: 'Blocks malicious traffic and reduces attacks that take a website offline.',
        },
      },
      {
        title: { vi: 'Xử lý sự cố', en: 'Fixing problems' },
        description: {
          vi: 'Khi web gặp sự cố, có người nhận việc và xử lý.',
          en: 'When your website has a problem, someone picks it up and fixes it.',
        },
      },
      {
        title: { vi: 'Chỉnh sửa nhỏ trong giờ hỗ trợ', en: 'Small edits within support hours' },
        description: {
          vi: 'Sửa nội dung, thay ảnh hoặc chỉnh nhỏ theo số giờ hỗ trợ của gói.',
          en: 'Content changes, new images and small tweaks, within the support hours of your package.',
        },
      },
      {
        title: { vi: 'Vá bảo mật hằng tháng', en: 'Monthly security patches' },
        description: {
          vi: 'Cập nhật đều đặn để website luôn được bảo vệ.',
          en: 'Regular updates keep your website protected.',
        },
      },
    ],
    faqs: [
      {
        question: {
          vi: 'Việc ngoài phạm vi gói thì sao?',
          en: 'What about work outside my package?',
        },
        answer: {
          vi: 'Khi vượt số giờ hỗ trợ của gói, chúng tôi báo giá riêng và chỉ làm khi bạn đồng ý.',
          en: 'When the work goes beyond the support hours of your package, we quote it separately and only start once you agree.',
        },
      },
    ],
    seo: {
      title: {
        vi: 'Bảo mật và hỗ trợ website — Dev House Software',
        en: 'Website security and support — Dev House Software',
      },
      description: {
        vi: 'Tường lửa, chống tấn công cơ bản, xử lý sự cố và vá bảo mật hằng tháng.',
        en: 'Firewall, basic attack protection, fixing problems and monthly security patches.',
      },
    },
  },
];

const step = (titleVi, titleEn, textVi, textEn) => ({
  title: { vi: titleVi, en: titleEn },
  description: { vi: textVi, en: textEn },
});

/**
 * How each group is set up, from the working process in the company direction document.
 * (The kinds of service inside a group have their own steps, see service-types.js.)
 */
const groupProcess = {
  'thiet-ke-website': [
    step(
      'Chọn mẫu và chốt gói',
      'Choose a template and a package',
      'Bạn chọn mẫu website và gói phù hợp. Hợp đồng ghi rõ phạm vi, giờ hỗ trợ, chủ sở hữu tên miền và dữ liệu; bạn trả trước tối thiểu 50% phí cài đặt.',
      'You pick a website template and a package. The contract spells out the scope, support hours and who owns the domain and data; you pay at least 50% of the setup fee up front.',
    ),
    step(
      'Dựng website từ mẫu chuẩn',
      'Build the website from a proven template',
      'Chúng tôi tạo website từ mẫu đã kiểm chứng, đưa nội dung và thương hiệu của bạn vào.',
      'We create the website from a proven template and add your content and brand.',
    ),
    step(
      'Duyệt trên bản thử',
      'Review the test version',
      'Bạn xem thử, góp ý và chúng tôi chỉnh cho đến khi bạn hài lòng.',
      'You look it over, give feedback and we adjust until you are happy.',
    ),
    step(
      'Đưa lên chính thức và bàn giao',
      'Go live and hand over',
      'Chúng tôi đưa website lên chính thức, giao tài khoản quản trị nội dung và hướng dẫn ngắn.',
      'We put the website live and give you a content account and a short guide.',
    ),
  ],
  'may-chu-va-ha-tang-dam-may': [
    step(
      'Dựng hạ tầng từ mẫu chuẩn',
      'Set up the hosting from a standard template',
      'Website, cơ sở dữ liệu, kết nối an toàn, giám sát và sao lưu được dựng bằng công cụ tự động theo một mẫu chuẩn.',
      'The website, its database, the secure connection, monitoring and backups are built with automated tools from a standard template.',
    ),
    step(
      'Trỏ tên miền',
      'Point the domain',
      'Tên miền được trỏ về website qua Cloudflare.',
      'The domain is pointed to the website through Cloudflare.',
    ),
    step(
      'Kiểm tra và đưa lên chính thức',
      'Check and go live',
      'Bạn duyệt trên bản thử, sau đó website được đưa lên chính thức.',
      'You review a test version, then the website goes live.',
    ),
    step(
      'Vận hành hằng ngày',
      'Day-to-day running',
      'Hệ thống tự theo dõi và cảnh báo, sao lưu theo lịch và vá bảo mật mỗi tháng.',
      'The system watches and alerts by itself, backs up on a schedule and applies security patches every month.',
    ),
  ],
  'ten-mien-va-dns': [
    step(
      'Chọn tên miền',
      'Choose the domain',
      'Bạn chọn tên miền mong muốn, chúng tôi kiểm tra tên còn trống.',
      'You pick the domain you want and we check that it is available.',
    ),
    step(
      'Đăng ký đứng tên bạn',
      'Register it in your name',
      'Tên miền được đăng ký bằng thông tin của bạn.',
      'The domain is registered with your details.',
    ),
    step(
      'Cấu hình DNS và email',
      'Set up DNS and email',
      'Trỏ tên miền về website qua Cloudflare và tạo email theo tên miền nếu gói có.',
      'We point the domain to the website through Cloudflare and create email on the domain if your package includes it.',
    ),
    step(
      'Gia hạn mỗi năm',
      'Renew every year',
      'Phí thu mỗi năm, trước ngày hết hạn, để tên miền không bị gián đoạn.',
      'The fee is charged yearly, before it expires, so the domain is never interrupted.',
    ),
  ],
  'bao-mat-va-ho-tro': [
    step(
      'Bật bảo vệ cho website',
      'Turn on protection for the website',
      'Tường lửa và chống quá tải cơ bản được bật ngay khi dựng website.',
      'The firewall and basic overload protection are turned on when the website is built.',
    ),
    step(
      'Bạn gửi yêu cầu qua một kênh duy nhất',
      'You send requests through one channel',
      'Mọi yêu cầu hỗ trợ đi qua cùng một kênh và được ghi lại.',
      'Every support request goes through the same channel and is logged.',
    ),
    step(
      'Chúng tôi xử lý và ghi lại thời gian',
      'We handle it and log the time',
      'Thời gian xử lý được ghi lại để tính vào giờ hỗ trợ của gói.',
      'The time spent is logged against the support hours of your package.',
    ),
    step(
      'Báo giá riêng khi vượt giờ',
      'Quote separately beyond the hours',
      'Việc ngoài phạm vi được báo giá riêng và chỉ làm khi bạn đồng ý.',
      'Work outside the package is quoted separately and only done once you agree.',
    ),
  ],
};

export const defaultServices = serviceGroups.map(group => ({
  ...group,
  process: groupProcess[group.slug.vi] || [],
}));
