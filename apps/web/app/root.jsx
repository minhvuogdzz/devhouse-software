import React from 'react';
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLocation,
} from 'react-router';
import { defaultSettings, localize } from '@devhouse/content';
import { apiClient } from './lib/api-client.js';
import { themeInitScript } from './lib/theme.js';
import { getLocaleFromUrl, getTranslation } from './lib/i18n.js';
import { Button } from './components/ui/Button.jsx';
import stylesHref from './app.css?url';

export const links = () => [
  { rel: 'stylesheet', href: stylesHref },
  { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
  { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192.png' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
];

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = getLocaleFromUrl(url.pathname);
  try {
    const res = await apiClient(`/site?locale=${locale}`);
    if (res.data?.settings) return { settings: res.data.settings, locale };
  } catch {
    // fall through to code defaults so the site never renders without contact details
  }
  return { settings: localize(defaultSettings, locale), locale };
}

export function Layout({ children }) {
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased selection:bg-primary-subtle selection:text-primary">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }) {
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

  let title = '500 - Lỗi máy chủ';
  let message = 'Đã xảy ra sự cố ngoài ý muốn. Vui lòng tải lại trang sau giây lát.';

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = t('notFound.title');
      message = t('notFound.desc');
    } else {
      title = `${error.status} - ${error.statusText || 'Lỗi yêu cầu'}`;
      message = error.data?.message || 'Không thể xử lý yêu cầu vào lúc này.';
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg text-fg">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary-subtle text-primary mx-auto flex items-center justify-center font-bold text-2xl">
          !
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-display text-fg tracking-tight">{title}</h1>
          <p className="text-sm text-fg-muted leading-relaxed">{message}</p>
        </div>
        <div>
          <Button to={prefix || '/'} variant="primary" className="w-full">
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
