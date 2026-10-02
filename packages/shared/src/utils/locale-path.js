import { DEFAULT_LOCALE } from '../constants/locales.js';

export const localePath = (path = '/', locale = DEFAULT_LOCALE) => {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // Remove any existing leading locale prefix
  const cleanPath = path.replace(/^\/en(\/|$)/, '/');

  if (locale === 'en') {
    if (cleanPath === '/' || cleanPath === '') {
      return '/en';
    }
    return `/en${cleanPath}`;
  }

  return cleanPath === '' ? '/' : cleanPath;
};

export const extractLocaleFromPath = path => {
  if (!path) return DEFAULT_LOCALE;
  if (path === '/en' || path.startsWith('/en/')) {
    return 'en';
  }
  return 'vi';
};
