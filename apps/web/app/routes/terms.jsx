import React from 'react';
import { useLoaderData } from 'react-router';
import { defaultPages, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { Badge } from '../components/ui/Badge.jsx';
import { Card } from '../components/ui/Card.jsx';
import { FileText } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  try {
    const res = await apiClient(`/pages/terms?locale=${locale}`);
    pageData = res.data?.resolved || res.data;
  } catch {
    pageData = defaultPages['terms'] || {};
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
        ? 'Terms of Service — Dev House Software'
        : 'Điều khoản Dịch vụ — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'Review the operational and legal terms governing the use of Dev House Software services.'
        : 'Các điều khoản và điều kiện pháp lý khi truy cập website và sử dụng dịch vụ của Dev House Software.',
    },
  ];
}

export default function TermsPage() {
  const { pageData, locale } = useLoaderData();
  const hero = pageData.sections?.hero ||
    defaultPages['terms']?.defaults?.hero || {
      heading: locale === 'en' ? 'Terms of Service' : 'Điều khoản Sử dụng Dịch vụ',
      lastUpdated:
        locale === 'en' ? 'Last updated: October 2026' : 'Cập nhật lần cuối: Tháng 10, 2026',
      content:
        locale === 'en'
          ? 'Welcome to Dev House Software. By accessing this website or engaging our professional engineering services, you agree to comply with our commercial terms, intellectual property protections, and governing professional standards.'
          : 'Chào mừng quý khách đến với website chính thức của Dev House Software. Việc truy cập và sử dụng dịch vụ của chúng tôi đồng nghĩa với việc bạn đồng ý với các điều khoản pháp lý, bản quyền tác giả và quy định bảo vệ sở hữu trí tuệ đã được ban hành.',
    };

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-4">
          <Badge variant="default" className="flex items-center gap-1.5 w-fit">
            <FileText className="w-3.5 h-3.5" />
            <span>{locale === 'en' ? 'Terms & Conditions' : 'Điều khoản & Quy định'}</span>
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
              {locale === 'en' ? '1. Scope of Services' : '1. Phạm vi Cung cấp Dịch vụ'}
            </h2>
            <p>
              {locale === 'en'
                ? 'Dev House Software delivers customized software engineering, digital architecture consulting, and enterprise maintenance services under mutually agreed statements of work (SOW).'
                : 'Dev House Software cung cấp các dịch vụ tư vấn kiến trúc công nghệ, lập trình phần mềm tùy biến và bảo trì hệ thống theo các hợp đồng dịch vụ cụ thể được ký kết.'}
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-6 text-sm">
            <h2 className="text-base font-bold font-display text-fg">
              {locale === 'en' ? '2. Intellectual Property' : '2. Quyền Sở hữu Trí tuệ'}
            </h2>
            <p>
              {locale === 'en'
                ? 'All custom software artifacts, source code, and design assets developed exclusively for a client become client property upon full settlement of contracted invoices.'
                : 'Mọi tài sản mã nguồn, thiết kế và hệ thống được phát triển chuyên biệt cho khách hàng sẽ hoàn toàn thuộc quyền sở hữu của khách hàng sau khi hoàn tất các nghĩa vụ thanh toán hợp đồng.'}
            </p>
          </div>

          <div className="space-y-4 border-t border-border pt-6 text-sm">
            <h2 className="text-base font-bold font-display text-fg">
              {locale === 'en' ? '3. Confidentiality' : '3. Bảo mật Thông tin'}
            </h2>
            <p>
              {locale === 'en'
                ? 'Both parties commit to non-disclosure of proprietary trade secrets, technical schematics, or non-public operational data shared during technical engagements.'
                : 'Hai bên cam kết giữ bí mật toàn bộ thông tin nội bộ, quy trình kỹ thuật và dữ liệu nghiệp vụ được chia sẻ trong suốt quá trình hợp tác.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
