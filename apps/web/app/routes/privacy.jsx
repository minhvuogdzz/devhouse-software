import React from 'react';
import { useLoaderData } from 'react-router';
import { defaultPages, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { ShieldCheck } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  try {
    const res = await apiClient(`/pages/privacy?locale=${locale}`);
    pageData = res.data?.resolved || res.data;
  } catch {
    pageData = defaultPages['privacy'] || {};
  }

  return {
    pageData: localize(pageData, locale),
    locale,
  };
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  return [
    {
      title: isEn
        ? 'Privacy Policy — Dev House Software'
        : 'Chính sách Bảo mật Thông tin — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'Read our commitments and guidelines on safeguarding your personal and business data.'
        : 'Quy định và cam kết bảo vệ dữ liệu, quyền riêng tư của khách hàng tại Dev House Software.',
    },
  ];
}

export default function PrivacyPage() {
  const { pageData, locale } = useLoaderData();
  const hero = pageData.sections?.hero ||
    defaultPages['privacy']?.defaults?.hero || {
      heading: locale === 'en' ? 'Privacy Policy' : 'Chính sách Bảo mật Thông tin',
      lastUpdated:
        locale === 'en' ? 'Last updated: October 2026' : 'Cập nhật lần cuối: Tháng 10, 2026',
      content:
        locale === 'en'
          ? 'Dev House Software is strictly committed to protecting the privacy and confidentiality of our clients and partners. Information collected via this website is used solely for project correspondence and technical consultations, and is never disclosed to external parties for commercial gain.'
          : 'Dev House Software cam kết bảo mật tuyệt đối các thông tin khách hàng và đối tác cung cấp. Chúng tôi chỉ thu thập các thông tin liên hệ cần thiết phục vụ quá trình trao đổi công việc, tư vấn giải pháp và đảm bảo không chia sẻ cho bên thứ ba vì bất kỳ mục đích thương mại nào.',
    };

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <Badge variant="default" className="flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{locale === 'en' ? 'Legal & Compliance' : 'Pháp lý & Cam kết'}</span>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-fg tracking-tight">
            {hero.heading}
          </h1>
          {hero.lastUpdated && <p className="text-sm text-fg-subtle">{hero.lastUpdated}</p>}
        </div>

        <Card className="p-6 sm:p-10 space-y-6 leading-relaxed text-fg-muted">
          <div className="space-y-4">
            <p className="text-base sm:text-lg text-fg font-medium">{hero.content}</p>
          </div>

          <div className="space-y-4 border-t border-border pt-6 text-sm">
            <h2 className="text-base font-bold font-display text-fg">
              {locale === 'en' ? '1. Collection of Data' : '1. Thu thập Thông tin'}
            </h2>
            <p>
              {locale === 'en'
                ? 'We only receive contact information (such as name, business email, organization name, and project scope) explicitly submitted by you through our project consultation forms.'
                : 'Chúng tôi chỉ tiếp nhận các dữ liệu liên hệ (như họ tên, email công vụ, tên doanh nghiệp và yêu cầu dự án) do quý khách chủ động gửi qua biểu mẫu tư vấn.'}
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-6 text-sm">
            <h2 className="text-base font-bold font-display text-fg">
              {locale === 'en' ? '2. Purpose of Processing' : '2. Mục đích Sử dụng'}
            </h2>
            <p>
              {locale === 'en'
                ? 'Information is processed strictly to assess engineering requirements, provide architectural recommendations, and communicate directly with project sponsors.'
                : 'Dữ liệu được dùng duy nhất để phân tích tính khả thi kỹ thuật, đề xuất kiến trúc và trực tiếp trao đổi giải pháp cùng đại diện doanh nghiệp.'}
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-6 text-sm">
            <h2 className="text-base font-bold font-display text-fg">
              {locale === 'en' ? '3. Data Security & Storage' : '3. An toàn Dữ liệu & Lưu trữ'}
            </h2>
            <p>
              {locale === 'en'
                ? 'We maintain robust administrative and technical protections to prevent unauthorized access or disclosure. We do not sell, rent, or trade client information.'
                : 'Chúng tôi áp dụng các tiêu chuẩn an ninh mạng nghiêm ngặt nhằm ngăn chặn truy cập trái phép. Cam kết không bán, chia sẻ hoặc thương mại hóa thông tin khách hàng.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
