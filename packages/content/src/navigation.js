/**
 * Default menus. The admin can edit both in Navigation; until then these apply.
 */
export const defaultNavigation = {
  header: [
    {
      id: 'services',
      label: { vi: 'Dịch vụ', en: 'Services' },
      path: '/services',
      order: 1,
      visible: true,
    },
    {
      id: 'packages',
      label: { vi: 'Bảng Giá & Gói Cước', en: 'Pricing & Packages' },
      path: '/packages',
      order: 2,
      visible: true,
    },
    {
      id: 'products',
      label: { vi: 'Mẫu website', en: 'Templates' },
      path: '/products',
      order: 3,
      visible: true,
    },
    {
      id: 'projects',
      label: { vi: 'Dự án', en: 'Projects' },
      path: '/projects',
      order: 4,
      visible: true,
    },
    {
      id: 'process',
      label: { vi: 'Quy trình', en: 'How we work' },
      path: '/#process',
      order: 5,
      visible: true,
    },
    {
      id: 'about',
      label: { vi: 'Về Devhouse', en: 'About Devhouse' },
      path: '/about',
      order: 6,
      visible: true,
    },
    {
      id: 'contact',
      label: { vi: 'Liên hệ', en: 'Contact' },
      path: '/contact',
      order: 7,
      visible: true,
    },
  ],
  footer: {
    columns: [
      {
        title: { vi: 'Dịch vụ trọn gói', en: 'Managed Services' },
        links: [
          {
            label: { vi: 'Thiết kế website & Shopify', en: 'Website & Shopify Design' },
            path: '/services/thiet-ke-website',
          },
          {
            label: { vi: 'Hạ tầng Cloud & DevSecOps', en: 'Cloud & DevSecOps' },
            path: '/services/may-chu-va-ha-tang-dam-may',
          },
          {
            label: { vi: 'Tên miền và DNS', en: 'Domain and DNS' },
            path: '/services/ten-mien-va-dns',
          },
          {
            label: { vi: 'Bảo mật và hỗ trợ định kỳ', en: 'Security & Maintenance' },
            path: '/services/bao-mat-va-ho-tro',
          },
        ],
      },
      {
        title: { vi: 'Mẫu web & Báo giá', en: 'Templates & Pricing' },
        links: [
          { label: { vi: 'Kho mẫu website', en: 'Website Templates' }, path: '/products' },
          { label: { vi: 'Bảng Giá & Gói Cước', en: 'Pricing & Packages' }, path: '/packages' },
          { label: { vi: 'Dự án tiêu biểu', en: 'Case Studies' }, path: '/projects' },
          { label: { vi: 'Năng lực công nghệ', en: 'Technologies' }, path: '/technologies' },
        ],
      },
      {
        title: { vi: 'Về Devhouse', en: 'Company' },
        links: [
          { label: { vi: 'Về chúng tôi', en: 'About Us' }, path: '/about' },
          { label: { vi: 'Góc nhìn công nghệ', en: 'Tech Blog' }, path: '/blog' },
          { label: { vi: 'Cơ hội nghề nghiệp', en: 'Careers' }, path: '/careers' },
          { label: { vi: 'Liên hệ tư vấn', en: 'Contact Us' }, path: '/contact' },
        ],
      },
      {
        title: { vi: 'Pháp lý', en: 'Legal' },
        links: [
          { label: { vi: 'Điều khoản dịch vụ', en: 'Terms of Service' }, path: '/terms' },
          { label: { vi: 'Chính sách bảo mật', en: 'Privacy Policy' }, path: '/privacy' },
        ],
      },
    ],
  },
};
