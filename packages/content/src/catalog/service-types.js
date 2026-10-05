/**
 * The kinds of service inside each of the four service groups, taken from the company direction
 * document. Each one has its own page that explains how it is set up. No prices or response
 * times are written here: those are not decided yet and live in the packages and contracts.
 * Plain language, Vietnamese and English. An admin can edit, hide or add to any of these.
 */
import { defaultServices } from './services.js';
import { localize } from '../resolve.js';

const PUBLISHED_AT = new Date('2026-01-01T00:00:00.000Z');

const t = (vi, en) => ({ vi, en });
// A titled line: used both for "what is included" and for the setup steps
const line = (titleVi, titleEn, textVi, textEn) => ({
  title: t(titleVi, titleEn),
  description: t(textVi, textEn),
});

const GROUPS = {
  website: { slug: 'thiet-ke-website', billing: 'one_time', base: 100 },
  hosting: { slug: 'may-chu-va-ha-tang-dam-may', billing: 'recurring', base: 200 },
  domain: { slug: 'ten-mien-va-dns', billing: 'yearly', base: 300 },
  security: { slug: 'bao-mat-va-ho-tro', billing: 'recurring', base: 400 },
};

function type(group, position, spec) {
  const g = GROUPS[group];
  return {
    parentSlug: g.slug,
    name: t(...spec.name),
    slug: t(...spec.slug),
    shortDescription: t(...spec.short),
    description: t(...spec.description),
    icon: spec.icon,
    billing: g.billing,
    order: g.base + position,
    status: 'published',
    publishedAt: PUBLISHED_AT,
    features: spec.points.map(p => line(...p)),
    process: spec.steps.map(s => line(...s)),
    faqs: (spec.faqs || []).map(([qVi, qEn, aVi, aEn]) => ({
      question: t(qVi, qEn),
      answer: t(aVi, aEn),
    })),
  };
}

export const defaultServiceTypes = [
  // ─── Website design (paid once) ─────────────────────────────────────────────
  type('website', 1, {
    name: ['Landing page', 'Landing page'],
    slug: ['landing-page', 'landing-page'],
    short: [
      'Một trang gọn gàng giới thiệu sản phẩm, dịch vụ hoặc chiến dịch, tập trung vào một hành động.',
      'One clean page that presents a product, a service or a campaign and focuses on a single action.',
    ],
    description: [
      'Landing page là một trang duy nhất giúp khách hiểu nhanh bạn cung cấp gì, rồi để lại thông tin hoặc bấm đặt hàng. Chúng tôi dựng từ mẫu có sẵn nên nhanh và chi phí hợp lý.',
      'A landing page is a single page that helps visitors quickly understand what you offer and then leave their details or place an order. We build it from a ready-made template, so it is quick and affordable.',
    ],
    icon: 'rocket',
    points: [
      [
        'Một trang, một mục tiêu',
        'One page, one goal',
        'Mọi nội dung dẫn khách tới một hành động bạn muốn.',
        'Everything on the page leads visitors to the one action you want.',
      ],
      [
        'Xem tốt trên điện thoại',
        'Looks good on a phone',
        'Bố cục tự co giãn theo màn hình.',
        'The layout adapts to the screen.',
      ],
      [
        'Có biểu mẫu liên hệ',
        'Includes a contact form',
        'Khách để lại thông tin ngay trên trang.',
        'Visitors leave their details right on the page.',
      ],
    ],
    steps: [
      [
        'Chọn mẫu',
        'Choose a template',
        'Bạn xem các mẫu landing page trong mục Mẫu website và chọn một mẫu bạn thích.',
        'You browse the landing page templates under Templates and pick one you like.',
      ],
      [
        'Đưa nội dung của bạn vào',
        'Add your content',
        'Chúng tôi thay chữ, hình ảnh và nút bấm theo thương hiệu của bạn.',
        'We replace the text, pictures and buttons with your brand.',
      ],
      [
        'Xem thử và chỉnh sửa',
        'Review and adjust',
        'Bạn duyệt trên bản thử, góp ý đến khi hài lòng.',
        'You review a test version and give feedback until you are happy.',
      ],
      [
        'Đưa lên chính thức',
        'Go live',
        'Chúng tôi đưa trang lên tên miền của bạn và bàn giao.',
        'We put the page live on your domain and hand it over.',
      ],
    ],
  }),
  type('website', 2, {
    name: ['Website giới thiệu doanh nghiệp', 'Business website'],
    slug: ['website-gioi-thieu-doanh-nghiep', 'business-website'],
    short: [
      'Website giới thiệu công ty, dịch vụ và thông tin liên hệ, rõ ràng và dễ cập nhật.',
      'A website that presents your company, services and contact details, clear and easy to update.',
    ],
    description: [
      'Phù hợp với cửa hàng, quán ăn, công ty nhỏ muốn có chỗ giới thiệu mình trên mạng. Website gồm vài trang cần thiết như giới thiệu, dịch vụ và liên hệ, dựng từ mẫu chuẩn.',
      'A good fit for shops, cafés and small companies that want a place to present themselves online. It has the few pages you need, such as about, services and contact, built from a proven template.',
    ],
    icon: 'globe',
    points: [
      [
        'Các trang cần thiết',
        'The pages you need',
        'Giới thiệu, dịch vụ, liên hệ và những trang bạn muốn thêm.',
        'About, services, contact and any other pages you want.',
      ],
      [
        'Bạn tự cập nhật nội dung',
        'Update the content yourself',
        'Chúng tôi giao tài khoản quản trị nội dung và hướng dẫn ngắn.',
        'We hand over a content account and a short guide.',
      ],
    ],
    steps: [
      [
        'Xác định các trang cần có',
        'Decide which pages you need',
        'Cùng bạn liệt kê các trang và nội dung cho từng trang.',
        'Together we list the pages and what goes on each one.',
      ],
      [
        'Dựng từ mẫu và đưa nội dung vào',
        'Build from a template and add your content',
        'Chúng tôi chỉnh mẫu theo màu sắc và hình ảnh của bạn.',
        'We adapt the template to your colours and pictures.',
      ],
      [
        'Duyệt trên bản thử',
        'Review the test version',
        'Bạn xem thử, góp ý và chúng tôi chỉnh lại.',
        'You look it over, give feedback and we adjust.',
      ],
      [
        'Đưa lên chính thức và bàn giao',
        'Go live and hand over',
        'Giao tài khoản quản trị nội dung và hướng dẫn ngắn.',
        'You receive a content account and a short guide.',
      ],
    ],
  }),
  type('website', 3, {
    name: ['Website bán hàng nhỏ', 'Small online shop'],
    slug: ['website-ban-hang-nho', 'small-online-shop'],
    short: [
      'Cửa hàng trực tuyến nhỏ với danh sách sản phẩm, giỏ hàng và quản lý đơn hàng.',
      'A small online shop with a product list, a cart and order management.',
    ],
    description: [
      'Dành cho cửa hàng muốn bán sản phẩm trên mạng mà không cần hệ thống phức tạp. Chúng tôi dựng từ mẫu bán hàng có sẵn, bạn đưa sản phẩm vào và bắt đầu nhận đơn.',
      'For shops that want to sell online without a complicated system. We build it from a ready-made shop template, you add your products and start taking orders.',
    ],
    icon: 'store',
    points: [
      [
        'Danh sách sản phẩm',
        'Product list',
        'Hình ảnh, mô tả và giá từng sản phẩm.',
        'Pictures, description and price for each product.',
      ],
      [
        'Giỏ hàng và đơn hàng',
        'Cart and orders',
        'Khách chọn hàng, bạn nhận và theo dõi đơn.',
        'Customers choose items and you receive and follow the orders.',
      ],
    ],
    steps: [
      [
        'Chuẩn bị sản phẩm',
        'Prepare your products',
        'Bạn cung cấp tên, hình ảnh và giá sản phẩm.',
        'You provide the names, pictures and prices of your products.',
      ],
      [
        'Dựng cửa hàng từ mẫu',
        'Build the shop from a template',
        'Chúng tôi dựng cửa hàng và nhập sản phẩm của bạn.',
        'We build the shop and enter your products.',
      ],
      [
        'Đặt thử một đơn hàng',
        'Place a test order',
        'Cùng kiểm tra từ lúc chọn hàng đến lúc nhận đơn.',
        'We check everything together, from choosing an item to receiving the order.',
      ],
      [
        'Đưa lên chính thức',
        'Go live',
        'Mở cửa hàng trên tên miền của bạn và hướng dẫn quản lý đơn.',
        'We open the shop on your domain and show you how to manage orders.',
      ],
    ],
  }),
  type('website', 4, {
    name: ['Cửa hàng trên Shopify', 'Shopify store'],
    slug: ['cua-hang-shopify', 'shopify-store'],
    short: [
      'Thiết lập cửa hàng trên Shopify: giao diện, sản phẩm và thanh toán để bạn bắt đầu bán.',
      'We set up a store on Shopify: the look, the products and payments, so you can start selling.',
    ],
    description: [
      'Shopify là nền tảng bán hàng có sẵn. Chúng tôi lo phần thiết lập và chỉnh giao diện để cửa hàng của bạn sẵn sàng bán, bạn chỉ cần tập trung vào sản phẩm.',
      'Shopify is a ready-made selling platform. We take care of the setup and the look so your store is ready to sell, and you focus on your products.',
    ],
    icon: 'store',
    points: [
      [
        'Giao diện (theme) Shopify',
        'Shopify theme',
        'Chọn và chỉnh giao diện hợp với thương hiệu.',
        'We choose and adjust a theme that suits your brand.',
      ],
      [
        'Sản phẩm và thanh toán',
        'Products and payments',
        'Nhập sản phẩm và thiết lập cách khách thanh toán.',
        'We enter your products and set up how customers pay.',
      ],
    ],
    steps: [
      [
        'Tạo và thiết lập cửa hàng',
        'Create and set up the store',
        'Chúng tôi tạo cửa hàng Shopify và thiết lập thông tin cơ bản.',
        'We create the Shopify store and set the basics.',
      ],
      [
        'Chọn và chỉnh giao diện',
        'Choose and adjust the theme',
        'Chỉnh màu sắc, bố cục và hình ảnh theo thương hiệu.',
        'We adjust colours, layout and pictures to your brand.',
      ],
      [
        'Nhập sản phẩm và thiết lập thanh toán',
        'Add products and set up payments',
        'Đưa sản phẩm vào cửa hàng và cấu hình cách thanh toán, giao hàng.',
        'We add the products and configure payment and delivery.',
      ],
      [
        'Kiểm tra đơn thử và bàn giao',
        'Test order and handover',
        'Đặt thử một đơn hàng, sau đó giao cửa hàng và hướng dẫn quản lý.',
        'We place a test order, then hand the store over with a short guide.',
      ],
    ],
  }),
  type('website', 5, {
    name: ['Website đồ án sinh viên', 'Student project website'],
    slug: ['website-do-an-sinh-vien', 'student-project-website'],
    short: [
      'Đưa đồ án hoặc dự án cá nhân lên mạng nhanh, có tên miền và kết nối an toàn để nộp bài hoặc trình diễn.',
      'Put a course or personal project online quickly, with a domain and a secure connection, ready to hand in or present.',
    ],
    description: [
      'Dành cho sinh viên cần sản phẩm chạy được trên mạng để nộp bài hoặc demo. Chúng tôi đưa sản phẩm có sẵn lên máy chủ đám mây, gắn tên miền và kết nối an toàn, với chi phí thấp.',
      'For students who need their work to run online to hand in or demo. We put your existing project on a cloud server and add a domain and a secure connection, at a low cost.',
    ],
    icon: 'users',
    points: [
      [
        'Đưa sản phẩm có sẵn lên mạng',
        'Put your existing work online',
        'Bạn gửi sản phẩm, chúng tôi lo phần chạy trên máy chủ.',
        'You send your work and we handle running it on a server.',
      ],
      [
        'Tên miền và kết nối an toàn',
        'Domain and secure connection',
        'Có đường dẫn riêng và biểu tượng ổ khoá trên trình duyệt.',
        'You get your own address and the padlock in the browser.',
      ],
    ],
    steps: [
      [
        'Gửi sản phẩm của bạn',
        'Send us your work',
        'Bạn gửi mã nguồn hoặc website đã làm.',
        'You send the source code or the website you made.',
      ],
      [
        'Đưa lên máy chủ đám mây',
        'Put it on a cloud server',
        'Chúng tôi cài đặt để sản phẩm chạy trên máy chủ.',
        'We set it up so it runs on a server.',
      ],
      [
        'Gắn tên miền và kết nối an toàn',
        'Add a domain and a secure connection',
        'Đường dẫn của bạn mở được bằng HTTPS.',
        'Your address opens over HTTPS.',
      ],
      [
        'Bàn giao đường dẫn',
        'Hand over the address',
        'Bạn dùng đường dẫn này để nộp bài hoặc trình diễn.',
        'You use this address to hand in or present your work.',
      ],
    ],
  }),

  // ─── Cloud hosting (recurring) ──────────────────────────────────────────────
  type('hosting', 1, {
    name: ['Máy chủ đám mây', 'Cloud server'],
    slug: ['may-chu-dam-may', 'cloud-server'],
    short: [
      'Website chạy trên máy chủ đám mây, không đặt trên máy tính văn phòng.',
      'Your website runs on a cloud server, not on an office computer.',
    ],
    description: [
      'Website chạy trên máy chủ đám mây nên không bị chậm hay ngừng khi mạng văn phòng chập chờn. Chi phí máy chủ tính theo mức dùng, vì vậy bạn không phải mua hay thuê nguyên một máy chủ riêng.',
      'Your website runs on a cloud server, so it does not slow down or stop when the office network is unreliable. The server cost follows what you use, so you do not need to buy or rent a whole server of your own.',
    ],
    icon: 'cloud',
    points: [
      [
        'Không đặt trên máy văn phòng',
        'Not on an office computer',
        'Website luôn có máy chủ chạy ổn định.',
        'Your website always has a dependable server.',
      ],
      [
        'Tách biệt với website khác',
        'Kept apart from other websites',
        'Sự cố của website khác không ảnh hưởng tới bạn.',
        'A problem on another website does not affect yours.',
      ],
    ],
    steps: [
      [
        'Chọn cấu hình theo gói',
        'Choose the setup that fits your package',
        'Gói Sinh viên, Cửa hàng và Doanh nghiệp nhỏ có mức hạ tầng khác nhau.',
        'The Student, Shop and Small business packages each have their own level of hosting.',
      ],
      [
        'Dựng máy chủ từ mẫu chuẩn',
        'Set up the server from a standard template',
        'Chúng tôi dùng công cụ tự động để mọi website được dựng giống nhau và ít sai sót.',
        'We use automated tools so every website is set up the same way, with fewer mistakes.',
      ],
      [
        'Cài website và kiểm tra',
        'Install the website and test it',
        'Kiểm tra website mở đúng và chạy mượt.',
        'We check that the website opens properly and runs smoothly.',
      ],
      [
        'Chuyển sang chính thức',
        'Switch to live',
        'Trỏ tên miền về máy chủ và bắt đầu theo dõi.',
        'We point your domain to the server and start monitoring.',
      ],
    ],
  }),
  type('hosting', 2, {
    name: ['Website chạy riêng biệt', 'Isolated hosting'],
    slug: ['website-chay-rieng-biet', 'isolated-hosting'],
    short: [
      'Mỗi website chạy trong một “ngăn” riêng trên máy chủ, nên không ảnh hưởng lẫn nhau.',
      'Each website runs in its own “compartment” on the server, so websites do not affect each other.',
    ],
    description: [
      'Nhiều website nhỏ dùng chung một cụm máy chủ nhưng mỗi website nằm trong một ngăn riêng (kỹ thuật gọi là container). Cách này giữ chi phí hợp lý mà vẫn tách biệt dữ liệu giữa các khách hàng.',
      'Several small websites share a group of servers, but each one sits in a compartment of its own (technically called a container). This keeps costs fair while keeping each customer’s data apart.',
    ],
    icon: 'lock',
    points: [
      [
        'Dữ liệu tách biệt',
        'Data kept apart',
        'Dữ liệu của bạn không lẫn với khách hàng khác.',
        'Your data does not mix with other customers.',
      ],
      [
        'Dựng và cập nhật nhất quán',
        'Consistent setup and updates',
        'Mỗi website được dựng theo cùng một cách.',
        'Every website is set up the same way.',
      ],
    ],
    steps: [
      [
        'Đóng gói website thành một bộ hoàn chỉnh',
        'Package the website as one complete unit',
        'Website và những gì nó cần được gom thành một bộ.',
        'The website and everything it needs are put together as one unit.',
      ],
      [
        'Chạy trong ngăn riêng',
        'Run it in its own compartment',
        'Bộ này chạy riêng trên máy chủ, tách khỏi các website khác.',
        'The unit runs by itself on the server, apart from other websites.',
      ],
      [
        'Kiểm tra hoạt động',
        'Check that it works',
        'Kiểm tra website mở đúng và kết nối với dữ liệu.',
        'We check the website opens properly and reaches its data.',
      ],
      [
        'Cập nhật khi có thay đổi',
        'Update when something changes',
        'Mỗi lần cập nhật đều theo cùng một quy trình.',
        'Every update follows the same routine.',
      ],
    ],
  }),
  type('hosting', 3, {
    name: ['Kết nối an toàn (HTTPS)', 'Secure connection (HTTPS)'],
    slug: ['ket-noi-an-toan-https', 'secure-connection-https'],
    short: [
      'Mọi website đều dùng kết nối mã hoá, hiện ổ khoá an toàn trên trình duyệt.',
      'Every website uses an encrypted connection and shows the secure padlock in the browser.',
    ],
    description: [
      'HTTPS giúp thông tin giữa khách truy cập và website của bạn được mã hoá, và trình duyệt không cảnh báo “không an toàn”. Với chúng tôi đây là điều bắt buộc cho mọi website.',
      'HTTPS encrypts the information between your visitors and your website, and browsers do not show a “not secure” warning. For us it is required on every website.',
    ],
    icon: 'lock',
    points: [
      [
        'Bắt buộc cho mọi website',
        'Required on every website',
        'Không có website nào chạy mà thiếu kết nối an toàn.',
        'No website runs without a secure connection.',
      ],
      [
        'Luôn còn hạn',
        'Always valid',
        'Chúng tôi theo dõi để chứng chỉ bảo mật không bị hết hạn.',
        'We keep an eye on it so the security certificate never expires.',
      ],
    ],
    steps: [
      [
        'Cấp chứng chỉ bảo mật cho tên miền',
        'Issue a security certificate for the domain',
        'Chứng chỉ cho trình duyệt biết website của bạn là thật.',
        'The certificate tells browsers your website is genuine.',
      ],
      [
        'Bật HTTPS cho toàn bộ website',
        'Turn on HTTPS for the whole website',
        'Mọi trang đều dùng kết nối mã hoá.',
        'Every page uses the encrypted connection.',
      ],
      [
        'Chuyển hướng truy cập cũ sang kết nối an toàn',
        'Send old visits to the secure address',
        'Ai mở bằng địa chỉ thường cũng được đưa sang HTTPS.',
        'Anyone who opens the plain address is sent to HTTPS.',
      ],
      [
        'Theo dõi hạn của chứng chỉ',
        'Watch the certificate’s expiry',
        'Gia hạn trước khi hết hạn để website không bị gián đoạn.',
        'We renew it in time so your website is never interrupted.',
      ],
    ],
  }),
  type('hosting', 4, {
    name: ['Giám sát và cảnh báo', 'Monitoring and alerts'],
    slug: ['giam-sat-va-canh-bao', 'monitoring-and-alerts'],
    short: [
      'Hệ thống tự theo dõi website và báo ngay khi có sự cố.',
      'The system watches your website and raises an alert as soon as something goes wrong.',
    ],
    description: [
      'Chúng tôi không đợi khách báo mới biết web có vấn đề. Công cụ giám sát kiểm tra website liên tục và gửi cảnh báo tự động để có người vào xử lý sớm.',
      'We do not wait for a customer to tell us something is wrong. Monitoring tools check your website all the time and send automatic alerts so someone can step in early.',
    ],
    icon: 'zap',
    points: [
      [
        'Theo dõi liên tục',
        'Always watching',
        'Website được kiểm tra thường xuyên, không cần bạn làm gì.',
        'Your website is checked regularly without you doing anything.',
      ],
      [
        'Cảnh báo tự động',
        'Automatic alerts',
        'Có sự cố là có thông báo cho người phụ trách.',
        'When something goes wrong, the person in charge is notified.',
      ],
    ],
    steps: [
      [
        'Cài công cụ theo dõi',
        'Set up the monitoring tools',
        'Công cụ được cài cùng lúc với website.',
        'The tools are installed together with the website.',
      ],
      [
        'Đặt ra khi nào cần cảnh báo',
        'Decide when to raise an alert',
        'Ví dụ khi website không mở được hoặc chạy quá chậm.',
        'For example when the website does not open or runs too slowly.',
      ],
      [
        'Nhận cảnh báo và vào xử lý',
        'Receive the alert and step in',
        'Người phụ trách nhận thông báo và kiểm tra nguyên nhân.',
        'The person in charge receives the notice and checks the cause.',
      ],
      [
        'Ghi lại sự cố',
        'Keep a record',
        'Sự cố được ghi lại để rút kinh nghiệm và báo cho bạn khi cần.',
        'The incident is recorded so we can learn from it and tell you when needed.',
      ],
    ],
  }),
  type('hosting', 5, {
    name: ['Sao lưu tự động', 'Automatic backups'],
    slug: ['sao-luu-tu-dong', 'automatic-backups'],
    short: [
      'Dữ liệu được sao lưu theo lịch để khôi phục khi cần.',
      'Your data is backed up on a schedule so it can be restored when needed.',
    ],
    description: [
      'Mỗi website được sao lưu tự động. Gói Sinh viên sao lưu hằng tuần, gói Cửa hàng sao lưu hằng ngày. Tần suất và số ngày giữ bản sao được ghi rõ trong hợp đồng.',
      'Every website is backed up automatically. The Student package backs up weekly and the Shop package daily. How often it runs and how long copies are kept is written into the contract.',
    ],
    icon: 'database',
    points: [
      [
        'Chạy tự động theo lịch',
        'Runs on a schedule',
        'Bạn không phải nhớ sao lưu.',
        'You never have to remember to back up.',
      ],
      [
        'Khôi phục khi cần',
        'Restore when needed',
        'Có bản sao để đưa website về lại khi xảy ra sự cố.',
        'There is a copy to bring your website back after a problem.',
      ],
    ],
    steps: [
      [
        'Đặt lịch sao lưu theo gói',
        'Set the backup schedule for your package',
        'Hằng tuần hoặc hằng ngày, tuỳ gói bạn chọn.',
        'Weekly or daily, depending on the package you choose.',
      ],
      [
        'Sao lưu chạy tự động',
        'Backups run by themselves',
        'Hệ thống lưu bản sao của website và dữ liệu.',
        'The system keeps a copy of the website and its data.',
      ],
      [
        'Giữ bản sao theo thời hạn trong hợp đồng',
        'Keep the copies for the period in the contract',
        'Bản sao cũ được xoá khi hết thời hạn.',
        'Old copies are removed when the period ends.',
      ],
      [
        'Khôi phục khi cần',
        'Restore when needed',
        'Khi có sự cố, chúng tôi đưa website về bản sao gần nhất.',
        'After a problem we bring your website back to the latest copy.',
      ],
    ],
  }),
  type('hosting', 6, {
    name: ['Cập nhật bảo mật định kỳ', 'Regular security updates'],
    slug: ['cap-nhat-bao-mat-dinh-ky', 'regular-security-updates'],
    short: [
      'Chúng tôi cập nhật phần mềm nền mỗi tháng để vá các lỗ hổng bảo mật đã biết.',
      'We update the underlying software every month to close known security holes.',
    ],
    description: [
      'Phần mềm nền của website liên tục được phát hiện lỗ hổng mới. Chúng tôi vá bảo mật hằng tháng để website của bạn luôn được bảo vệ. Gói Doanh nghiệp nhỏ còn có báo cáo bảo mật hằng tháng.',
      'New weaknesses are found in the software underneath a website all the time. We apply security patches every month so your website stays protected. The Small business package also includes a monthly security report.',
    ],
    icon: 'wrench',
    points: [
      [
        'Vá bảo mật hằng tháng',
        'Monthly security patches',
        'Cập nhật đều đặn, không để lỗ hổng cũ tồn tại.',
        'Regular updates, so old weaknesses are not left open.',
      ],
      [
        'Báo cáo bảo mật hằng tháng',
        'Monthly security report',
        'Có trong gói Doanh nghiệp nhỏ.',
        'Included in the Small business package.',
      ],
    ],
    steps: [
      [
        'Theo dõi lỗ hổng mới',
        'Follow newly found weaknesses',
        'Chúng tôi xem các thông báo bảo mật liên quan tới phần mềm đang dùng.',
        'We watch security notices for the software in use.',
      ],
      [
        'Cập nhật phần mềm nền mỗi tháng',
        'Update the software every month',
        'Áp dụng bản vá cho máy chủ và website.',
        'We apply the patches to the server and the website.',
      ],
      [
        'Kiểm tra lại website',
        'Check the website again',
        'Đảm bảo website vẫn chạy bình thường sau khi cập nhật.',
        'We make sure the website still works normally after the update.',
      ],
      [
        'Báo cáo (gói Doanh nghiệp nhỏ)',
        'Report (Small business package)',
        'Gửi báo cáo bảo mật hằng tháng cho bạn.',
        'We send you a monthly security report.',
      ],
    ],
  }),

  // ─── Domain and DNS (yearly) ────────────────────────────────────────────────
  type('domain', 1, {
    name: ['Đăng ký tên miền', 'Domain registration'],
    slug: ['dang-ky-ten-mien', 'domain-registration'],
    short: [
      'Chúng tôi đăng ký tên miền cho bạn, đứng tên bạn.',
      'We register a domain for you, in your name.',
    ],
    description: [
      'Tên miền là địa chỉ website của bạn, ví dụ tencuaban.com. Chúng tôi giúp chọn và đăng ký tên miền, và luôn đăng ký đứng tên bạn để bạn toàn quyền khi cần chuyển đi nơi khác.',
      'The domain is your website’s address, for example yourname.com. We help you choose and register it, always in your name so you keep full control if you ever want to move.',
    ],
    icon: 'globe',
    points: [
      [
        'Đứng tên bạn',
        'Registered in your name',
        'Chủ sở hữu là bạn, không phải chúng tôi.',
        'You are the owner, not us.',
      ],
    ],
    steps: [
      [
        'Bạn chọn tên miền mong muốn',
        'You pick the domain you want',
        'Chúng tôi gợi ý nếu bạn chưa nghĩ ra.',
        'We suggest options if you have not decided.',
      ],
      [
        'Kiểm tra tên còn trống',
        'Check that it is available',
        'Nếu tên đã có người dùng, cùng chọn tên khác.',
        'If the name is taken, we choose another together.',
      ],
      [
        'Đăng ký bằng thông tin của bạn',
        'Register with your details',
        'Tên miền được đăng ký đứng tên bạn.',
        'The domain is registered in your name.',
      ],
      [
        'Bàn giao quyền quản lý',
        'Hand over control',
        'Bạn nắm thông tin tên miền; chúng tôi quản lý giúp bạn trong thời gian hợp tác.',
        'You hold the details of the domain; we manage it for you while we work together.',
      ],
    ],
  }),
  type('domain', 2, {
    name: ['Gia hạn tên miền', 'Domain renewal'],
    slug: ['gia-han-ten-mien', 'domain-renewal'],
    short: [
      'Chúng tôi gia hạn trước ngày hết hạn để website không bị gián đoạn.',
      'We renew it before the expiry date so your website never goes offline.',
    ],
    description: [
      'Tên miền hết hạn là website ngừng hoạt động. Phí tên miền thu mỗi năm, trước ngày hết hạn, và chúng tôi lo việc gia hạn đúng hẹn.',
      'When a domain expires the website stops working. The domain fee is charged once a year, before it expires, and we take care of renewing it on time.',
    ],
    icon: 'clock',
    points: [
      [
        'Thu mỗi năm, trước ngày hết hạn',
        'Charged yearly, before it expires',
        'Không thu theo tháng.',
        'Never billed monthly.',
      ],
    ],
    steps: [
      [
        'Theo dõi ngày hết hạn',
        'Track the expiry date',
        'Chúng tôi ghi nhớ hạn của từng tên miền.',
        'We keep track of the expiry of every domain.',
      ],
      [
        'Nhắc bạn trước hạn',
        'Remind you before it expires',
        'Bạn biết trước khoản phí gia hạn sắp tới.',
        'You know about the upcoming renewal fee in advance.',
      ],
      [
        'Thu phí gia hạn một năm',
        'Collect the one-year renewal fee',
        'Thu trước ngày hết hạn.',
        'Collected before the expiry date.',
      ],
      [
        'Gia hạn đúng hẹn',
        'Renew on time',
        'Tên miền được gia hạn trước khi hết hạn.',
        'The domain is renewed before it expires.',
      ],
    ],
  }),
  type('domain', 3, {
    name: ['Cấu hình DNS qua Cloudflare', 'DNS setup with Cloudflare'],
    slug: ['cau-hinh-dns-cloudflare', 'dns-setup-cloudflare'],
    short: [
      'Trỏ tên miền về đúng website và thêm lớp bảo vệ cơ bản.',
      'We point the domain to your website and add a basic layer of protection.',
    ],
    description: [
      'DNS là “danh bạ” cho biết tên miền của bạn trỏ về đâu. Chúng tôi cấu hình DNS qua Cloudflare để website, email hoạt động đúng, đồng thời có thêm lớp bảo vệ cơ bản.',
      'DNS is the “phone book” that says where your domain points. We set up DNS through Cloudflare so your website and email work properly, with a basic layer of protection added.',
    ],
    icon: 'link',
    points: [
      [
        'Qua Cloudflare',
        'Through Cloudflare',
        'Quản lý DNS tập trung và có lớp bảo vệ cơ bản.',
        'DNS is managed in one place with a basic layer of protection.',
      ],
    ],
    steps: [
      [
        'Thêm tên miền vào Cloudflare',
        'Add the domain to Cloudflare',
        'Chúng tôi tạo cấu hình cho tên miền của bạn.',
        'We create the setup for your domain.',
      ],
      [
        'Trỏ tên miền về website',
        'Point the domain to your website',
        'Khách gõ tên miền là mở đúng website.',
        'Visitors who type the domain reach the right website.',
      ],
      [
        'Bật lớp bảo vệ cơ bản',
        'Turn on the basic protection',
        'Dùng tính năng bảo vệ của Cloudflare.',
        'We use Cloudflare’s protection features.',
      ],
      [
        'Kiểm tra',
        'Check',
        'Mở website bằng tên miền để chắc chắn mọi thứ hoạt động.',
        'We open the website on the domain to be sure everything works.',
      ],
    ],
  }),
  type('domain', 4, {
    name: ['Email theo tên miền', 'Email on your domain'],
    slug: ['email-theo-ten-mien', 'email-on-your-domain'],
    short: [
      'Địa chỉ email mang tên doanh nghiệp, ví dụ ten@congty.com.',
      'Email addresses with your own business name, such as name@yourcompany.com.',
    ],
    description: [
      'Email theo tên miền giúp bạn trông chuyên nghiệp hơn so với địa chỉ email miễn phí. Chúng tôi tạo hộp thư và cấu hình trên tên miền của bạn (có trong gói Cửa hàng).',
      'Email on your own domain looks more professional than a free address. We create the mailboxes and set them up on your domain (included in the Shop package).',
    ],
    icon: 'mail',
    points: [
      [
        'Mang tên doanh nghiệp',
        'Carries your business name',
        'Khách tin tưởng hơn khi nhận thư từ tên miền riêng.',
        'Customers trust mail from your own domain more.',
      ],
    ],
    steps: [
      [
        'Chọn địa chỉ email',
        'Choose the addresses',
        'Ví dụ lienhe@congty.com hoặc tên từng người.',
        'For example contact@yourcompany.com or each person’s name.',
      ],
      [
        'Tạo hộp thư trên tên miền',
        'Create the mailboxes on the domain',
        'Cấu hình DNS để nhận và gửi thư đúng.',
        'We set up DNS so mail is received and sent properly.',
      ],
      [
        'Hướng dẫn dùng',
        'Show you how to use it',
        'Cài trên điện thoại và máy tính của bạn.',
        'We set it up on your phone and computer.',
      ],
      [
        'Gửi và nhận thử',
        'Send and receive a test',
        'Kiểm tra thư đi và đến đúng.',
        'We check that mail goes out and arrives properly.',
      ],
    ],
  }),

  // ─── Security and support (recurring) ───────────────────────────────────────
  type('security', 1, {
    name: ['Tường lửa bảo vệ website', 'Website firewall'],
    slug: ['tuong-lua-bao-ve-website', 'website-firewall'],
    short: [
      'Tường lửa chặn các truy cập độc hại trước khi chúng tới website của bạn.',
      'A firewall blocks malicious traffic before it reaches your website.',
    ],
    description: [
      'Tường lửa ứng dụng web (WAF) đứng trước website, lọc các yêu cầu đáng ngờ như dò mật khẩu hay khai thác lỗ hổng. Chúng tôi bật và theo dõi tường lửa này cho bạn qua Cloudflare.',
      'A web application firewall (WAF) stands in front of your website and filters suspicious requests, such as password guessing or attempts to exploit weaknesses. We turn it on and watch it for you through Cloudflare.',
    ],
    icon: 'shield',
    points: [
      [
        'Chặn truy cập độc hại',
        'Blocks malicious traffic',
        'Giảm nguy cơ website bị xâm nhập.',
        'Lowers the chance of your website being broken into.',
      ],
    ],
    steps: [
      [
        'Bật tường lửa cho tên miền',
        'Turn the firewall on for the domain',
        'Thực hiện qua Cloudflare.',
        'Done through Cloudflare.',
      ],
      [
        'Đặt quy tắc chặn',
        'Set the blocking rules',
        'Chặn các kiểu truy cập độc hại đã biết.',
        'We block the known kinds of malicious traffic.',
      ],
      [
        'Theo dõi các lượt bị chặn',
        'Watch what gets blocked',
        'Xem có dấu hiệu tấn công bất thường không.',
        'We look for signs of unusual attacks.',
      ],
      [
        'Điều chỉnh khi cần',
        'Adjust when needed',
        'Cập nhật quy tắc khi xuất hiện kiểu tấn công mới.',
        'We update the rules when a new kind of attack appears.',
      ],
    ],
  }),
  type('security', 2, {
    name: ['Chống tấn công quá tải cơ bản', 'Basic overload-attack protection'],
    slug: ['chong-tan-cong-qua-tai', 'overload-attack-protection'],
    short: [
      'Giảm thiểu các đợt tấn công dồn truy cập làm website ngừng hoạt động.',
      'Reduces the attacks that flood a website with traffic and take it offline.',
    ],
    description: [
      'Tấn công quá tải (DDoS) dồn rất nhiều truy cập giả vào website để làm nó sập. Chúng tôi bật lớp chống tấn công cơ bản qua Cloudflare để hạn chế phần lớn các trường hợp thường gặp.',
      'An overload attack (DDoS) floods a website with fake visits to bring it down. We turn on a basic layer of protection through Cloudflare to limit the most common cases.',
    ],
    icon: 'zap',
    points: [
      [
        'Bảo vệ cơ bản',
        'Basic protection',
        'Phù hợp với website của cửa hàng và doanh nghiệp nhỏ.',
        'Suited to the websites of shops and small businesses.',
      ],
    ],
    steps: [
      [
        'Bật chống quá tải qua Cloudflare',
        'Turn on overload protection through Cloudflare',
        'Cấu hình ngay khi dựng website.',
        'Set up when the website is built.',
      ],
      [
        'Theo dõi lượng truy cập bất thường',
        'Watch for unusual traffic',
        'Phát hiện sớm khi lượng truy cập tăng đột ngột.',
        'We spot sudden jumps in traffic early.',
      ],
      [
        'Giảm thiểu khi có đợt tấn công',
        'Limit the damage during an attack',
        'Lọc bớt truy cập giả để website tiếp tục hoạt động.',
        'We filter out the fake traffic so the website keeps working.',
      ],
      [
        'Báo cho bạn',
        'Tell you',
        'Cho bạn biết chuyện gì xảy ra và đã xử lý thế nào.',
        'We let you know what happened and what we did.',
      ],
    ],
  }),
  type('security', 3, {
    name: ['Xử lý sự cố', 'Fixing problems'],
    slug: ['xu-ly-su-co', 'fixing-problems'],
    short: [
      'Khi website gặp sự cố, có người nhận việc và xử lý.',
      'When your website has a problem, someone picks it up and fixes it.',
    ],
    description: [
      'Mọi yêu cầu hỗ trợ đi qua một kênh duy nhất và được ghi lại để tính giờ minh bạch. Thời gian phản hồi và giờ làm việc cho từng gói được ghi rõ trong hợp đồng.',
      'Every support request goes through a single channel and is logged so hours are counted fairly. The response time and working hours for each package are written into the contract.',
    ],
    icon: 'headset',
    points: [
      [
        'Một kênh hỗ trợ duy nhất',
        'A single support channel',
        'Bạn luôn biết gửi yêu cầu ở đâu.',
        'You always know where to send a request.',
      ],
      [
        'Ghi lại để tính giờ',
        'Logged to count hours',
        'Rõ ràng việc nào được tính vào giờ hỗ trợ.',
        'It is clear which work counts towards your support hours.',
      ],
    ],
    steps: [
      [
        'Bạn báo sự cố qua kênh hỗ trợ',
        'You report the problem through the support channel',
        'Mô tả ngắn chuyện gì đang xảy ra.',
        'A short description of what is happening.',
      ],
      [
        'Chúng tôi nhận việc và tìm nguyên nhân',
        'We pick it up and find the cause',
        'Có người phụ trách kiểm tra website và máy chủ.',
        'Someone is in charge of checking the website and the server.',
      ],
      [
        'Khắc phục và kiểm tra lại',
        'Fix it and check again',
        'Đảm bảo website hoạt động bình thường.',
        'We make sure the website works normally again.',
      ],
      [
        'Báo kết quả và ghi lại',
        'Report back and log it',
        'Bạn biết đã làm gì; thời gian xử lý được ghi lại để tính giờ.',
        'You know what was done; the time spent is logged to count hours.',
      ],
    ],
    faqs: [
      [
        'Bao lâu thì có người xử lý?',
        'How soon will someone handle it?',
        'Thời gian phản hồi và giờ làm việc được ghi rõ trong hợp đồng của từng gói.',
        'The response time and working hours are written into the contract of each package.',
      ],
    ],
  }),
  type('security', 4, {
    name: ['Chỉnh sửa nhỏ trong giờ hỗ trợ', 'Small edits within support hours'],
    slug: ['chinh-sua-nho-trong-gio-ho-tro', 'small-edits-within-support-hours'],
    short: [
      'Sửa nội dung, thay ảnh hoặc chỉnh nhỏ theo số giờ hỗ trợ của gói.',
      'Content changes, new pictures and small tweaks, within the support hours of your package.',
    ],
    description: [
      'Mỗi gói có một số giờ hỗ trợ mỗi tháng. Bạn có thể dùng giờ này để nhờ chúng tôi sửa chữ, thay ảnh hay chỉnh nhỏ trên website. Khi vượt số giờ, chúng tôi báo giá riêng và chỉ làm khi bạn đồng ý.',
      'Each package comes with a number of support hours per month. You can use them to ask us to change text, swap pictures or make small tweaks. When you go beyond the hours, we quote separately and only start once you agree.',
    ],
    icon: 'wrench',
    points: [
      [
        'Dùng trong số giờ của gói',
        'Within your package’s hours',
        'Gói Sinh viên thấp nhất, gói Doanh nghiệp nhỏ cao nhất.',
        'The Student package has the fewest, the Small business package the most.',
      ],
      [
        'Báo giá riêng khi vượt giờ',
        'Quoted separately beyond the hours',
        'Không phát sinh chi phí khi bạn chưa đồng ý.',
        'No extra cost until you agree.',
      ],
    ],
    steps: [
      [
        'Bạn gửi yêu cầu chỉnh sửa',
        'You send the change request',
        'Qua kênh hỗ trợ duy nhất.',
        'Through the single support channel.',
      ],
      [
        'Chúng tôi thực hiện trong số giờ của gói',
        'We do it within your package’s hours',
        'Việc nhỏ như đổi chữ, thay ảnh được làm nhanh.',
        'Small jobs like changing text or a picture are done quickly.',
      ],
      [
        'Ghi lại thời gian đã dùng',
        'Log the time used',
        'Bạn biết mình còn bao nhiêu giờ.',
        'You know how many hours you have left.',
      ],
      [
        'Báo giá riêng nếu vượt giờ',
        'Quote separately if it goes over',
        'Chỉ làm tiếp khi bạn đồng ý.',
        'We only continue once you agree.',
      ],
    ],
  }),
];

/**
 * Groups and their types as one list, in one language, shaped like the public API answers
 * (`parent` is { slug, name } for a type, null for a group). Used only when the API cannot be reached.
 */
export function resolveDefaultServices(locale) {
  const groups = defaultServices.map(group => ({ ...group, parent: null }));
  const types = defaultServiceTypes.map(item => {
    const group = defaultServices.find(g => g.slug.vi === item.parentSlug);
    return { ...item, parent: group ? { slug: group.slug, name: group.name } : null };
  });
  return localize([...groups, ...types], locale).sort((a, b) => a.order - b.order);
}
