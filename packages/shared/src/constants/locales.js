export const LOCALES = ['vi', 'en'];
export const SUPPORTED_LOCALES = LOCALES;
export const DEFAULT_LOCALE = 'vi';

export const isSupportedLocale = locale => typeof locale === 'string' && LOCALES.includes(locale);

export const LOCALE_LABELS = {
  vi: 'Tiếng Việt',
  en: 'English',
};
