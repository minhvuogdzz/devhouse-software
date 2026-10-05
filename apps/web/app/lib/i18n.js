import vi from '../locales/vi.js';
import en from '../locales/en.js';

const dictionaries = { vi, en };

export function getTranslation(locale = 'vi') {
  const dict = dictionaries[locale] || dictionaries.vi;
  return function t(path, fallback = '') {
    const keys = path.split('.');
    let cur = dict;
    for (const k of keys) {
      if (!cur || typeof cur !== 'object') return fallback || path;
      cur = cur[k];
    }
    return cur !== undefined ? cur : fallback || path;
  };
}

export function getLocaleFromUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    return /^\/en(\/|$)/.test(url.pathname) ? 'en' : 'vi';
  } catch {
    return /^\/en(\/|$)/.test(urlStr || '') ? 'en' : 'vi';
  }
}

export function getAlternateLocalePath(pathname) {
  if (/^\/en(\/|$)/.test(pathname)) {
    return pathname.slice(3) || '/';
  }
  return pathname === '/' ? '/en' : `/en${pathname}`;
}
