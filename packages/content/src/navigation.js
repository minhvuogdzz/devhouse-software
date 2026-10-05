/**
 * Default menus. The admin can edit both in Navigation; until then these apply.
 * Solutions, Projects, Technologies and Blog pages still exist and can be added back to the menu.
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
      label: { vi: 'Gói dịch vụ', en: 'Packages' },
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
      id: 'process',
      label: { vi: 'Quy trình', en: 'How we work' },
      path: '/#process',
      order: 4,
      visible: true,
    },
    {
      id: 'about',
      label: { vi: 'Về chúng tôi', en: 'About us' },
      path: '/about',
      order: 5,
      visible: true,
    },
    {
      id: 'contact',
      label: { vi: 'Liên hệ', en: 'Contact' },
      path: '/contact',
      order: 6,
      visible: true,
    },
  ],
  footer: {
    columns: [
      {
        title: { vi: 'Dịch vụ', en: 'Services' },
        links: [
          {
            label: { vi: 'Thiết kế website', en: 'Website design' },
            path: '/services/thiet-ke-website',
          },
          {
            label: { vi: 'Máy chủ và hạ tầng đám mây', en: 'Cloud hosting' },
            path: '/services/may-chu-va-ha-tang-dam-may',
          },
          {
            label: { vi: 'Tên miền và DNS', en: 'Domain and DNS' },
            path: '/services/ten-mien-va-dns',
          },
          {
            label: { vi: 'Bảo mật và hỗ trợ', en: 'Security and support' },
            path: '/services/bao-mat-va-ho-tro',
          },
        ],
      },
      {
        title: { vi: 'Công ty', en: 'Company' },
        links: [
          { label: { vi: 'Về chúng tôi', en: 'About us' }, path: '/about' },
          { label: { vi: 'Gói dịch vụ', en: 'Packages' }, path: '/packages' },
          { label: { vi: 'Mẫu website', en: 'Templates' }, path: '/products' },
          { label: { vi: 'Bài viết', en: 'Blog' }, path: '/blog' },
          { label: { vi: 'Tuyển dụng', en: 'Careers' }, path: '/careers' },
        ],
      },
      {
        title: { vi: 'Hỗ trợ và pháp lý', en: 'Support and legal' },
        links: [
          { label: { vi: 'Liên hệ tư vấn', en: 'Contact us' }, path: '/contact' },
          { label: { vi: 'Điều khoản dịch vụ', en: 'Terms of service' }, path: '/terms' },
          { label: { vi: 'Chính sách bảo mật', en: 'Privacy policy' }, path: '/privacy' },
        ],
      },
    ],
  },
};
