import { defineSection, field } from '../define.js';

export const termsHero = defineSection({
  key: 'hero',
  label: 'Tiêu đề Điều khoản',
  fields: {
    heading: field.text({ max: 120, required: true }),
    lastUpdated: field.text({ max: 60 }),
    content: field.textarea({ max: 1000 }),
  },
  defaults: {
    heading: { vi: 'Điều khoản dịch vụ', en: 'Terms of service' },
    lastUpdated: {
      vi: 'Cập nhật lần cuối: Tháng 10, 2026',
      en: 'Last updated: October 2026',
    },
    content: {
      vi: 'Trang này tóm tắt cách Devhouse Software làm việc với khách hàng. Điều khoản chính thức của từng khách hàng nằm trong hợp đồng hai bên cùng ký.',
      en: 'This page summarises how Devhouse Software works with customers. The binding terms for each customer are in the contract both sides sign.',
    },
  },
});

export const termsClauses = defineSection({
  key: 'clauses',
  label: 'Các điều khoản',
  fields: {
    items: field.list({
      of: field.group({
        fields: { title: field.text({ max: 100 }), body: field.textarea({ max: 800 }) },
      }),
    }),
  },
  defaults: {
    items: [
      {
        title: { vi: '1. Phạm vi công việc', en: '1. Scope of work' },
        body: {
          vi: 'Mỗi khách hàng có một hợp đồng ghi rõ phạm vi công việc, số giờ hỗ trợ, chủ sở hữu tên miền và chủ sở hữu dữ liệu.',
          en: 'Every customer has a contract that states the scope of work, the number of support hours, who owns the domain and who owns the data.',
        },
      },
      {
        title: { vi: '2. Phí cài đặt', en: '2. Setup fee' },
        body: {
          vi: 'Khách hàng trả trước tối thiểu 50% phí cài đặt khi ký hợp đồng. Phần còn lại được trả khi bàn giao.',
          en: 'The customer pays at least 50% of the setup fee when the contract is signed. The remainder is paid on delivery.',
        },
      },
      {
        title: { vi: '3. Phí duy trì', en: '3. Recurring fee' },
        body: {
          vi: 'Phí duy trì hạ tầng và hỗ trợ được thanh toán vào đầu mỗi kỳ, theo quý hoặc theo năm, không theo tháng.',
          en: 'The fee for hosting and support is paid at the start of each period, per quarter or per year, never monthly.',
        },
      },
      {
        title: { vi: '4. Tên miền', en: '4. Domain name' },
        body: {
          vi: 'Tên miền được đăng ký đứng tên khách hàng. Phí tên miền được thu mỗi năm, trước ngày hết hạn.',
          en: 'The domain name is registered in the customer name. The domain fee is paid every year, before it expires.',
        },
      },
      {
        title: { vi: '5. Hỗ trợ', en: '5. Support' },
        body: {
          vi: 'Số giờ hỗ trợ mỗi tháng và những việc được tính vào đó được ghi trong hợp đồng. Yêu cầu hỗ trợ gửi qua một kênh duy nhất và được ghi lại để tính giờ.',
          en: 'The monthly support hours and what counts towards them are stated in the contract. Support requests are sent through one channel and logged so hours can be counted.',
        },
      },
      {
        title: { vi: '6. Công việc ngoài phạm vi', en: '6. Work outside the scope' },
        body: {
          vi: 'Khi công việc vượt số giờ hỗ trợ của gói, Devhouse báo giá riêng và chỉ thực hiện khi khách hàng đồng ý.',
          en: 'When work goes beyond the support hours of the package, Devhouse quotes it separately and only starts once the customer agrees.',
        },
      },
      {
        title: { vi: '7. Bảo mật thông tin', en: '7. Confidentiality' },
        body: {
          vi: 'Thông tin của khách hàng được giữ kín. Devhouse sẵn sàng ký thỏa thuận bảo mật (NDA) theo yêu cầu.',
          en: 'Customer information is kept confidential. Devhouse is happy to sign a non-disclosure agreement (NDA) on request.',
        },
      },
      {
        title: { vi: '8. Kết thúc hợp đồng', en: '8. Ending the contract' },
        body: {
          vi: 'Khi hợp đồng kết thúc, Devhouse bàn giao lại mã nguồn, bản sao lưu dữ liệu và quyền quản lý tên miền cho khách hàng. Hạ tầng được xóa sau thời hạn hai bên thống nhất.',
          en: 'When the contract ends, Devhouse hands back the source code, a backup of the data and control of the domain name. The hosting is removed after a period agreed by both sides.',
        },
      },
    ],
  },
});

export const termsPage = {
  key: 'terms',
  title: { vi: 'Điều khoản dịch vụ', en: 'Terms of service' },
  sections: [termsHero, termsClauses],
  seo: {
    title: {
      vi: 'Điều khoản dịch vụ — Devhouse Software',
      en: 'Terms of service — Devhouse Software',
    },
    description: {
      vi: 'Cách Devhouse Software làm việc với khách hàng: thanh toán, tên miền, hỗ trợ và kết thúc hợp đồng.',
      en: 'How Devhouse Software works with customers: payments, domains, support and ending a contract.',
    },
  },
};
