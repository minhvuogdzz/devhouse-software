export const defaultCategories = [
  // Product segments ("mảng"): the broad area a template belongs to
  {
    type: 'product-segment',
    slug: { vi: 'website', en: 'website' },
    name: { vi: 'Website', en: 'Website' },
    description: { vi: 'Mẫu website hoàn chỉnh.', en: 'Complete website templates.' },
    order: 1,
  },
  {
    type: 'product-segment',
    slug: { vi: 'theme-shopify', en: 'shopify-theme' },
    name: { vi: 'Theme Shopify', en: 'Shopify theme' },
    description: { vi: 'Giao diện cho cửa hàng Shopify.', en: 'Themes for Shopify stores.' },
    order: 2,
  },
  {
    type: 'product-segment',
    slug: { vi: 'game', en: 'game' },
    name: { vi: 'Game', en: 'Games' },
    description: {
      vi: 'Trò chơi chơi thử ngay trên trình duyệt.',
      en: 'Games you can try in the browser.',
    },
    order: 3,
  },
  {
    type: 'product-segment',
    slug: { vi: 'ung-dung', en: 'app' },
    name: { vi: 'Ứng dụng', en: 'Apps' },
    description: {
      vi: 'Ứng dụng xem thử ngay trên trình duyệt.',
      en: 'Apps you can try in the browser.',
    },
    order: 4,
  },

  // Product categories ("thể loại"): the kind of site a template is
  {
    type: 'product',
    slug: { vi: 'website-ban-hang', en: 'online-store' },
    name: { vi: 'Website bán hàng', en: 'Online store' },
    description: { vi: 'Bán sản phẩm trực tuyến.', en: 'Sell products online.' },
    order: 1,
  },
  {
    type: 'product',
    slug: { vi: 'landing-page', en: 'landing-page' },
    name: { vi: 'Landing page', en: 'Landing page' },
    description: {
      vi: 'Một trang giới thiệu gọn, tập trung vào hành động.',
      en: 'A focused single page.',
    },
    order: 2,
  },
  {
    type: 'product',
    slug: { vi: 'website-gioi-thieu', en: 'business-website' },
    name: { vi: 'Website giới thiệu doanh nghiệp', en: 'Business website' },
    description: {
      vi: 'Giới thiệu công ty và dịch vụ.',
      en: 'Present a company and its services.',
    },
    order: 3,
  },
  {
    type: 'product',
    slug: { vi: 'quan-an-do-uong', en: 'food-and-drink' },
    name: { vi: 'Quán ăn và đồ uống', en: 'Food and drink' },
    description: { vi: 'Thực đơn điện tử và đặt bàn.', en: 'Digital menus and bookings.' },
    order: 4,
  },
  {
    type: 'product',
    slug: { vi: 'do-an-sinh-vien', en: 'student-project' },
    name: { vi: 'Đồ án sinh viên', en: 'Student project' },
    description: {
      vi: 'Website cho đồ án và dự án cá nhân.',
      en: 'Websites for course and personal projects.',
    },
    order: 5,
  },

  // Solution categories
  {
    type: 'solution',
    slug: { vi: 'van-hanh-doanh-nghiep', en: 'enterprise-operations' },
    name: { vi: 'Vận hành Doanh nghiệp', en: 'Enterprise Operations' },
    description: {
      vi: 'Giải pháp số hóa toàn diện quy trình quản trị nội bộ.',
      en: 'Comprehensive digital solutions for core enterprise workflows.',
    },
    order: 1,
  },
  {
    type: 'solution',
    slug: { vi: 'trai-nghiem-khach-hang', en: 'customer-experience' },
    name: { vi: 'Trải nghiệm Khách hàng', en: 'Customer Experience' },
    description: {
      vi: 'Nền tảng kết nối và tương tác khách hàng đa kênh.',
      en: 'Omnichannel customer engagement and digital commerce platforms.',
    },
    order: 2,
  },

  // Technology categories
  {
    type: 'technology',
    slug: { vi: 'frontend', en: 'frontend' },
    name: { vi: 'Giao diện & Trải nghiệm (Frontend)', en: 'Frontend & UI' },
    description: {
      vi: 'Công nghệ xây dựng giao diện hiện đại, tối ưu hiệu năng.',
      en: 'Modern frontend frameworks engineered for fluid user interaction.',
    },
    order: 1,
  },
  {
    type: 'technology',
    slug: { vi: 'backend-api', en: 'backend-api' },
    name: { vi: 'Hệ thống Máy chủ (Backend & API)', en: 'Backend & APIs' },
    description: {
      vi: 'Nền tảng máy chủ bảo mật, xử lý dữ liệu tin cậy.',
      en: 'Robust, secure backend engines and high-throughput APIs.',
    },
    order: 2,
  },
  {
    type: 'technology',
    slug: { vi: 'co-so-du-lieu', en: 'databases' },
    name: { vi: 'Cơ sở Dữ liệu', en: 'Databases & Storage' },
    description: {
      vi: 'Giải pháp lưu trữ và quản trị dữ liệu quy mô lớn.',
      en: 'Resilient data persistence and high-availability database engines.',
    },
    order: 3,
  },
  {
    type: 'technology',
    slug: { vi: 'ha-tang-devops', en: 'devops-cloud' },
    name: { vi: 'Hạ tầng & Vận hành (Cloud & DevOps)', en: 'Cloud & DevOps' },
    description: {
      vi: 'Công cụ đóng gói, triển khai và tự động hóa hạ tầng.',
      en: 'Containerization, continuous integration, and cloud platforms.',
    },
    order: 4,
  },

  // Project segments ("mảng"): the broad area a project belongs to
  {
    type: 'project-segment',
    slug: { vi: 'website', en: 'website' },
    name: { vi: 'Website', en: 'Website' },
    description: { vi: 'Website đã thực hiện.', en: 'Websites we have built.' },
    order: 1,
  },
  {
    type: 'project-segment',
    slug: { vi: 'theme-shopify', en: 'shopify-theme' },
    name: { vi: 'Theme Shopify', en: 'Shopify theme' },
    description: { vi: 'Giao diện cho cửa hàng Shopify.', en: 'Themes for Shopify stores.' },
    order: 2,
  },
  {
    type: 'project-segment',
    slug: { vi: 'game', en: 'game' },
    name: { vi: 'Game', en: 'Games' },
    description: {
      vi: 'Trò chơi chơi thử ngay trên trình duyệt.',
      en: 'Games you can try in the browser.',
    },
    order: 3,
  },
  {
    type: 'project-segment',
    slug: { vi: 'ung-dung', en: 'app' },
    name: { vi: 'Ứng dụng', en: 'Apps' },
    description: {
      vi: 'Ứng dụng xem thử ngay trên trình duyệt.',
      en: 'Apps you can try in the browser.',
    },
    order: 4,
  },

  // Project categories ("thể loại"): the kind of site a project is
  {
    type: 'project',
    slug: { vi: 'website-ban-hang', en: 'online-store' },
    name: { vi: 'Website bán hàng', en: 'Online store' },
    description: { vi: 'Bán sản phẩm trực tuyến.', en: 'Sell products online.' },
    order: 1,
  },
  {
    type: 'project',
    slug: { vi: 'landing-page', en: 'landing-page' },
    name: { vi: 'Landing page', en: 'Landing page' },
    description: {
      vi: 'Một trang giới thiệu gọn, tập trung vào hành động.',
      en: 'A focused single page.',
    },
    order: 2,
  },
  {
    type: 'project',
    slug: { vi: 'website-gioi-thieu', en: 'business-website' },
    name: { vi: 'Website giới thiệu doanh nghiệp', en: 'Business website' },
    description: {
      vi: 'Giới thiệu công ty và dịch vụ.',
      en: 'Present a company and its services.',
    },
    order: 3,
  },
  {
    type: 'project',
    slug: { vi: 'quan-an-do-uong', en: 'food-and-drink' },
    name: { vi: 'Quán ăn và đồ uống', en: 'Food and drink' },
    description: { vi: 'Thực đơn điện tử và đặt bàn.', en: 'Digital menus and bookings.' },
    order: 4,
  },
  {
    type: 'project',
    slug: { vi: 'do-an-sinh-vien', en: 'student-project' },
    name: { vi: 'Đồ án sinh viên', en: 'Student project' },
    description: {
      vi: 'Website cho đồ án và dự án cá nhân.',
      en: 'Websites for course and personal projects.',
    },
    order: 5,
  },
];
