import { describe, it, expect } from 'vitest';
import { getTranslation, getLocaleFromUrl, getAlternateLocalePath } from '../app/lib/i18n.js';
import vi from '../app/locales/vi.js';
import en from '../app/locales/en.js';

const flatten = (object, prefix = '') =>
  Object.entries(object).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? flatten(value, `${prefix}${key}.`)
      : [[`${prefix}${key}`, value]],
  );

describe('Web i18n utility', () => {
  it('detects locale from URL pathname accurately', () => {
    expect(getLocaleFromUrl('http://localhost:3000/en')).toBe('en');
    expect(getLocaleFromUrl('http://localhost:3000/en/services')).toBe('en');
    expect(getLocaleFromUrl('http://localhost:3000/en/blog/post-1')).toBe('en');
    expect(getLocaleFromUrl('http://localhost:3000/')).toBe('vi');
    expect(getLocaleFromUrl('http://localhost:3000/services')).toBe('vi');
    expect(getLocaleFromUrl('http://localhost:3000/about')).toBe('vi');
  });

  it('generates alternate locale paths correctly', () => {
    // From VI to EN
    expect(getAlternateLocalePath('/', 'en')).toBe('/en');
    expect(getAlternateLocalePath('/services', 'en')).toBe('/en/services');
    expect(getAlternateLocalePath('/projects/core-sys', 'en')).toBe('/en/projects/core-sys');

    // From EN to VI
    expect(getAlternateLocalePath('/en', 'vi')).toBe('/');
    expect(getAlternateLocalePath('/en/', 'vi')).toBe('/');
    expect(getAlternateLocalePath('/en/services', 'vi')).toBe('/services');
    expect(getAlternateLocalePath('/en/projects/core-sys', 'vi')).toBe('/projects/core-sys');
  });

  it('retrieves nested translations for vi and en', () => {
    const tVi = getTranslation('vi');
    const tEn = getTranslation('en');

    expect(tVi('header.nav.services')).toBe('Dịch vụ');
    expect(tEn('header.nav.services')).toBe('Services');

    expect(tVi('contact.title')).toBeTruthy();
    expect(tEn('contact.title')).toBeTruthy();

    // Fallback key if missing
    expect(tVi('unknown.key.name')).toBe('unknown.key.name');
  });

  it('has exactly the same keys in Vietnamese and English', () => {
    const viKeys = flatten(vi)
      .map(([key]) => key)
      .sort();
    const enKeys = flatten(en)
      .map(([key]) => key)
      .sort();
    expect(enKeys).toEqual(viKeys);
  });

  it('never leaves a text empty, and keeps the same {placeholders} in both languages', () => {
    const placeholders = text => (text.match(/\{[a-zA-Z]+\}/g) || []).sort();
    const enByKey = Object.fromEntries(flatten(en));
    for (const [key, text] of flatten(vi)) {
      expect(text.trim(), key).not.toBe('');
      expect(enByKey[key].trim(), key).not.toBe('');
      expect(placeholders(enByKey[key]), key).toEqual(placeholders(text));
    }
  });

  it('does not mistake a path that merely starts with "en" for English', () => {
    expect(getLocaleFromUrl('/enterprise')).toBe('vi');
    expect(getLocaleFromUrl('/en/enterprise')).toBe('en');
    expect(getAlternateLocalePath('/enterprise')).toBe('/en/enterprise');
  });
});
