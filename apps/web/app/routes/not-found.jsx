import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { defaultPages, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Button } from '../components/ui/Button.jsx';
import { Home } from 'lucide-react';

export function getLocaleFromRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/en') ? 'en' : 'vi';
}

export async function loader({ request }) {
  const locale = getLocaleFromRequest(request);

  let pageData = null;
  try {
    const res = await apiClient(`/pages/not-found?locale=${locale}`);
    pageData = res.data?.resolved || res.data;
  } catch {
    pageData = defaultPages['not-found'] || {};
  }

  throw new Response(JSON.stringify({ pageData: localize(pageData, locale), locale }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function meta({ error }) {
  let locale = 'vi';
  if (error && isRouteErrorResponse(error)) {
    try {
      const parsed = JSON.parse(error.data);
      locale = parsed.locale || 'vi';
    } catch {
      /* ignore */
    }
  }
  const isEn = locale === 'en';
  return [
    {
      title: isEn
        ? '404 — Page Not Found — Dev House Software'
        : '404 — Không tìm thấy trang — Dev House Software',
    },
  ];
}

export default function NotFoundPage() {
  const error = useRouteError();
  let pageData = {};
  let locale = 'vi';

  if (error && isRouteErrorResponse(error)) {
    try {
      const parsed = JSON.parse(error.data);
      pageData = parsed.pageData || {};
      locale = parsed.locale || 'vi';
    } catch {
      /* ignore */
    }
  }

  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  const hero = pageData.sections?.hero ||
    defaultPages['not-found']?.defaults?.hero || {
      heading:
        locale === 'en'
          ? 'The page you are looking for could not be found'
          : 'Trang bạn tìm kiếm hiện không tồn tại',
      subheading:
        locale === 'en'
          ? 'The requested URL may have moved or is no longer available. Please return to the homepage or reach out for assistance.'
          : 'Đường dẫn có thể đã thay đổi hoặc không còn khả dụng. Vui lòng quay lại trang chủ hoặc liên hệ với chúng tôi nếu bạn cần hỗ trợ.',
    };

  return (
    <div className="py-20 lg:py-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-subtle text-primary font-extrabold text-2xl font-display">
          404
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-fg tracking-tight">
            {hero.heading}
          </h1>
          <p className="text-base text-fg-muted max-w-lg mx-auto leading-relaxed">
            {hero.subheading}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button as={Link} to={`${prefix}/`} variant="primary" size="lg">
            <Home className="w-4 h-4 mr-2" />
            {t('common.backToHome')}
          </Button>
          <Button as={Link} to={`${prefix}/services`} variant="outline" size="lg">
            {t('common.exploreServices')}
          </Button>
        </div>
      </div>
    </div>
  );
}
