import { makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

const noteList = field.list({
  of: field.group({
    fields: { title: field.text({ max: 80 }), description: field.textarea({ max: 300 }) },
  }),
});

export const packagesHero = defineSection({
  key: 'hero',
  label: 'Hero Gói dịch vụ',
  fields: {
    eyebrow: field.text({ max: 80 }),
    heading: field.text({ max: 120, required: true }),
    subheading: field.textarea({ max: 400 }),
  },
  defaults: {
    eyebrow: { vi: 'Gói dịch vụ', en: 'Packages' },
    heading: {
      vi: 'Chọn gói phù hợp với bạn',
      en: 'Choose the package that fits you',
    },
    subheading: {
      vi: 'Mỗi gói gồm phí cài đặt một lần và phí duy trì theo quý hoặc năm. Giá và phạm vi hỗ trợ được ghi rõ trước khi ký hợp đồng.',
      en: 'Every package has a one-time setup fee and a recurring fee per quarter or year. Prices and the scope of support are written down before you sign.',
    },
  },
});

export const packagesList = defineSection({
  key: 'list',
  label: 'Danh sách gói (cách hiển thị)',
  fields: { display: field.display({ maxColumns: 4 }) },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
  },
});

export const packagesPayment = defineSection({
  key: 'payment',
  label: 'Cách thanh toán',
  fields: {
    heading: field.text({ max: 120 }),
    items: noteList,
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
    heading: { vi: 'Cách thanh toán', en: 'How payment works' },
    items: [
      {
        title: { vi: 'Phí cài đặt', en: 'Setup fee' },
        description: {
          vi: 'Trả trước tối thiểu 50% khi ký hợp đồng, phần còn lại khi bàn giao.',
          en: 'At least 50% is paid when the contract is signed and the rest on delivery.',
        },
      },
      {
        title: { vi: 'Phí duy trì', en: 'Recurring fee' },
        description: {
          vi: 'Trả vào đầu mỗi kỳ, theo quý hoặc theo năm, không tính theo tháng.',
          en: 'Paid at the start of each period, per quarter or per year, never monthly.',
        },
      },
      {
        title: { vi: 'Tên miền', en: 'Domain' },
        description: {
          vi: 'Trả mỗi năm, trước ngày hết hạn. Tên miền luôn đứng tên bạn.',
          en: 'Paid yearly, before it expires. The domain always stays in your name.',
        },
      },
      {
        title: { vi: 'Việc ngoài phạm vi', en: 'Work outside the package' },
        description: {
          vi: 'Báo giá riêng khi vượt số giờ hỗ trợ của gói, chỉ làm khi bạn đồng ý.',
          en: 'Quoted separately when it goes beyond the support hours of your package, and only done once you agree.',
        },
      },
    ],
  },
});

export const packagesCommitments = defineSection({
  key: 'commitments',
  label: 'Cam kết dịch vụ',
  fields: {
    heading: field.text({ max: 120 }),
    intro: field.textarea({ max: 300 }),
    items: noteList,
    display: field.display(),
  },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
    heading: { vi: 'Cam kết dịch vụ', en: 'Service commitments' },
    intro: {
      vi: 'Mỗi gói có cam kết riêng, được ghi rõ trong hợp đồng.',
      en: 'Each package has its own commitments, written into the contract.',
    },
    items: [
      {
        title: { vi: 'Thời gian phản hồi', en: 'Response time' },
        description: {
          vi: 'Bao lâu từ lúc bạn báo lỗi đến khi có người nhận việc.',
          en: 'How long it takes from your report to someone picking it up.',
        },
      },
      {
        title: { vi: 'Giờ làm việc', en: 'Working hours' },
        description: {
          vi: 'Hỗ trợ trong giờ hành chính hay cả ngày đêm khi web ngừng hoạt động.',
          en: 'Support during office hours or around the clock when the website is down.',
        },
      },
      {
        title: { vi: 'Sao lưu', en: 'Backups' },
        description: {
          vi: 'Sao lưu bao lâu một lần và giữ bản sao trong bao nhiêu ngày.',
          en: 'How often backups run and how many days they are kept.',
        },
      },
      {
        title: { vi: 'Giờ hỗ trợ', en: 'Support hours' },
        description: {
          vi: 'Số giờ hỗ trợ mỗi tháng và những việc được tính vào đó.',
          en: 'The number of support hours each month and what counts towards them.',
        },
      },
    ],
  },
});

export const packagesIndexPage = {
  key: 'packages-index',
  title: { vi: 'Bảng Giá & Gói Cước', en: 'Pricing & Packages' },
  sections: [packagesHero, packagesList, packagesPayment, packagesCommitments],
  seo: {
    title: {
      vi: 'Gói dịch vụ — Devhouse Software',
      en: 'Packages — Devhouse Software',
    },
    description: {
      vi: 'Gói Sinh viên, Cửa hàng và Doanh nghiệp nhỏ: website, máy chủ, tên miền và bảo mật trọn gói.',
      en: 'Student, Shop and Small business packages: website, hosting, domain and security in one.',
    },
  },
};
