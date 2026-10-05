/**
 * Packages from the company direction document. Prices are deliberately empty:
 * they are not decided yet, and the website shows "contact us for a quote" until an admin fills them in.
 */
const PUBLISHED_AT = new Date('2026-01-01T00:00:00.000Z');

const item = (vi, en) => ({ text: { vi, en } });

export const defaultPackages = [
  {
    name: { vi: 'Gói Sinh viên', en: 'Student package' },
    slug: { vi: 'sinh-vien', en: 'student' },
    audience: {
      vi: 'Đồ án, dự án cá nhân',
      en: 'Course projects and personal projects',
    },
    shortDescription: {
      vi: 'Đưa website của bạn lên mạng nhanh, có tên miền và kết nối an toàn để nộp bài hoặc trình diễn.',
      en: 'Put your website online quickly, with a domain and a secure connection, ready to hand in or present.',
    },
    inclusions: [
      item('Đưa website có sẵn lên máy chủ đám mây', 'Your existing website put on a cloud server'),
      item('Tên miền', 'A domain name'),
      item('Kết nối an toàn (HTTPS)', 'Secure connection (HTTPS)'),
      item('Sao lưu hằng tuần', 'Weekly backups'),
    ],
    supportHours: { vi: 'Mức thấp nhất', en: 'Lowest level' },
    setupFee: null,
    recurringFee: null,
    recurringPeriod: 'year',
    currency: 'VND',
    priceNote: { vi: '', en: '' },
    isFeatured: false,
    order: 1,
    status: 'published',
    publishedAt: PUBLISHED_AT,
  },
  {
    name: { vi: 'Gói Cửa hàng', en: 'Shop package' },
    slug: { vi: 'cua-hang', en: 'shop' },
    audience: {
      vi: 'Cửa hàng, quán ăn và đồ uống',
      en: 'Shops, restaurants and cafes',
    },
    shortDescription: {
      vi: 'Website giới thiệu hoặc bán hàng ổn định, giá hợp lý, bạn không phải lo kỹ thuật.',
      en: 'A dependable website to present or sell your products, at a fair price, with no technical worries.',
    },
    inclusions: [
      item('Website dựng từ mẫu', 'A website built from a template'),
      item('Máy chủ đám mây (hosting)', 'Cloud hosting'),
      item('Tên miền', 'A domain name'),
      item('Email theo tên miền', 'Email on your domain'),
      item('Sao lưu hằng ngày', 'Daily backups'),
      item('Giám sát tự động', 'Automatic monitoring'),
    ],
    supportHours: { vi: 'Mức trung bình', en: 'Medium level' },
    setupFee: null,
    recurringFee: null,
    recurringPeriod: 'year',
    currency: 'VND',
    priceNote: { vi: '', en: '' },
    isFeatured: false,
    order: 2,
    status: 'published',
    publishedAt: PUBLISHED_AT,
  },
  {
    name: { vi: 'Gói Doanh nghiệp nhỏ', en: 'Small business package' },
    slug: { vi: 'doanh-nghiep-nho', en: 'small-business' },
    audience: {
      vi: 'Công ty nhỏ, startup',
      en: 'Small companies and startups',
    },
    shortDescription: {
      vi: 'Website theo yêu cầu với môi trường thử riêng và báo cáo bảo mật hằng tháng, có cam kết thời gian phản hồi.',
      en: 'A website built to your needs, with its own test environment and a monthly security report, backed by a response-time commitment.',
    },
    inclusions: [
      item('Website theo yêu cầu', 'A website built to your requirements'),
      item('Môi trường thử nghiệm riêng', 'A separate test environment'),
      item(
        'Cập nhật website tự động, an toàn',
        'Automatic, safe updates when your website changes',
      ),
      item('Báo cáo bảo mật hằng tháng', 'Monthly security report'),
    ],
    supportHours: { vi: 'Mức cao nhất', en: 'Highest level' },
    setupFee: null,
    recurringFee: null,
    recurringPeriod: 'year',
    currency: 'VND',
    priceNote: { vi: '', en: '' },
    isFeatured: false,
    order: 3,
    status: 'published',
    publishedAt: PUBLISHED_AT,
  },
];
