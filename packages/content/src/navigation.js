export const defaultNavigation = {
  header: [
    { id: 'home', label: { vi: 'Trang chủ', en: 'Home' }, path: '/', order: 1, visible: true },
    {
      id: 'services',
      label: { vi: 'Dịch vụ', en: 'Services' },
      path: '/services',
      order: 2,
      visible: true,
    },
    {
      id: 'solutions',
      label: { vi: 'Giải pháp', en: 'Solutions' },
      path: '/solutions',
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
      id: 'technologies',
      label: { vi: 'Công nghệ', en: 'Technologies' },
      path: '/technologies',
      order: 5,
      visible: true,
    },
    {
      id: 'about',
      label: { vi: 'Giới thiệu', en: 'About' },
      path: '/about',
      order: 6,
      visible: true,
    },
    { id: 'blog', label: { vi: 'Bài viết', en: 'Blog' }, path: '/blog', order: 7, visible: true },
    {
      id: 'contact',
      label: { vi: 'Liên hệ', en: 'Contact' },
      path: '/contact',
      order: 8,
      visible: true,
    },
  ],
  footer: {
    columns: [
      {
        title: { vi: 'Dịch vụ chính', en: 'Key Services' },
        links: [
          {
            label: { vi: 'Phát triển Web Doanh nghiệp', en: 'Enterprise Web Development' },
            path: '/services',
          },
          {
            label: { vi: 'Ứng dụng Di động iOS & Android', en: 'Mobile App Engineering' },
            path: '/services',
          },
          {
            label: { vi: 'Tích hợp Trí tuệ Nhân tạo', en: 'AI & Automation Solutions' },
            path: '/services',
          },
          {
            label: { vi: 'Kiến trúc Đám mây & DevOps', en: 'Cloud & DevOps Architecture' },
            path: '/services',
          },
        ],
      },
      {
        title: { vi: 'Công ty', en: 'Company' },
        links: [
          { label: { vi: 'Về chúng tôi', en: 'About Us' }, path: '/about' },
          { label: { vi: 'Dự án tiêu biểu', en: 'Case Studies' }, path: '/projects' },
          { label: { vi: 'Năng lực công nghệ', en: 'Technologies' }, path: '/technologies' },
          { label: { vi: 'Cơ hội nghề nghiệp', en: 'Careers' }, path: '/careers' },
          { label: { vi: 'Tin tức & Chia sẻ', en: 'Blog' }, path: '/blog' },
        ],
      },
      {
        title: { vi: 'Pháp lý', en: 'Legal' },
        links: [
          { label: { vi: 'Điều khoản dịch vụ', en: 'Terms of Service' }, path: '/terms' },
          { label: { vi: 'Chính sách bảo mật', en: 'Privacy Policy' }, path: '/privacy' },
          { label: { vi: 'Liên hệ tư vấn', en: 'Contact' }, path: '/contact' },
        ],
      },
    ],
  },
};
