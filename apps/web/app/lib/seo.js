export function generateSeoMeta({
  title,
  description,
  url,
  locale,
  type = 'website',
  jsonLd = null,
}) {
  const isEn = locale === 'en';

  let baseUrl = 'https://devhouse.vn';
  let pathname = '/';
  if (url) {
    try {
      const parsed = new URL(url);
      baseUrl = parsed.origin;
      pathname = parsed.pathname;
    } catch (_e) {
      // ignore
    }
  }

  const pathWithoutLocale = pathname.replace(/^\/en(\/|$)/, '/') || '/';
  const cleanPath = pathWithoutLocale === '//' ? '/' : pathWithoutLocale;
  const viUrl = `${baseUrl}${cleanPath === '/' ? '' : cleanPath}`;
  const enUrl = `${baseUrl}/en${cleanPath === '/' ? '' : cleanPath}`;
  const currentUrl = locale === 'en' ? enUrl : viUrl;

  const tags = [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: currentUrl },
    { tagName: 'link', rel: 'alternate', hrefLang: 'vi', href: viUrl || `${baseUrl}/` },
    { tagName: 'link', rel: 'alternate', hrefLang: 'en', href: enUrl || `${baseUrl}/en` },
    { tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: viUrl || `${baseUrl}/` },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: currentUrl },
    { property: 'og:site_name', content: 'Devhouse Software' },
    { property: 'og:locale', content: isEn ? 'en_US' : 'vi_VN' },
    { property: 'og:type', content: type },
    { property: 'og:image', content: `${baseUrl}/brand/devhouse-logo.png?v=20261011` },
    { property: 'og:image:width', content: '512' },
    { property: 'og:image:height', content: '512' },
    { name: 'twitter:card', content: 'summary' },
    { name: 'twitter:image', content: `${baseUrl}/brand/devhouse-logo.png?v=20261011` },
  ];

  if (jsonLd) {
    tags.push({
      'script:ld+json': jsonLd,
    });
  }

  return tags;
}
