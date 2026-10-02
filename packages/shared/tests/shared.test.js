import { describe, it, expect } from 'vitest';
import {
  slugify,
  localePath,
  hasPermission,
  buildCloudinaryUrl,
  LOCALES,
  DEFAULT_LOCALE,
  LocalizedStringSchema,
} from '../src/index.js';

describe('@devhouse/shared', () => {
  describe('constants', () => {
    it('defines supported locales and default locale', () => {
      expect(LOCALES).toEqual(['vi', 'en']);
      expect(DEFAULT_LOCALE).toBe('vi');
    });
  });

  describe('slugify', () => {
    it('transliterates Vietnamese diacritics correctly', () => {
      const input = 'Phát triển Phần mềm Doanh nghiệp & Ứng dụng AI';
      const expected = 'phat-trien-phan-mem-doanh-nghiep-ung-dung-ai';
      expect(slugify(input)).toBe(expected);
    });

    it('handles special characters and extra spaces', () => {
      expect(slugify('  Hệ thống --- ERP   Đám mây!! ')).toBe('he-thong-erp-dam-may');
    });
  });

  describe('localePath', () => {
    it('returns unprefixed paths for default locale (vi)', () => {
      expect(localePath('/services', 'vi')).toBe('/services');
      expect(localePath('/', 'vi')).toBe('/');
    });

    it('returns /en prefixed paths for english locale', () => {
      expect(localePath('/services', 'en')).toBe('/en/services');
      expect(localePath('/', 'en')).toBe('/en');
    });

    it('handles already prefixed paths smoothly', () => {
      expect(localePath('/en/about', 'vi')).toBe('/about');
      expect(localePath('/en/about', 'en')).toBe('/en/about');
    });
  });

  describe('permissions', () => {
    it('allows everything for wildcard *', () => {
      expect(hasPermission(['*'], 'services:create')).toBe(true);
      expect(hasPermission(['*'], 'anything')).toBe(true);
    });

    it('checks explicit permissions accurately', () => {
      const userPerms = ['services:read', 'services:create'];
      expect(hasPermission(userPerms, 'services:read')).toBe(true);
      expect(hasPermission(userPerms, 'services:delete')).toBe(false);
    });
  });

  describe('cloudinary', () => {
    it('formats cloudinary transform URL', () => {
      const url = buildCloudinaryUrl('devhouse/sample.png', {
        cloudName: 'devhouse',
        width: 800,
        height: 600,
      });
      expect(url).toBe(
        'https://res.cloudinary.com/devhouse/image/upload/f_auto,q_auto,c_fill,w_800,h_600/devhouse/sample.png',
      );
    });
  });

  describe('schemas', () => {
    it('parses valid localized string', () => {
      const parsed = LocalizedStringSchema.parse({ vi: 'Xin chào', en: 'Hello' });
      expect(parsed.vi).toBe('Xin chào');
      expect(parsed.en).toBe('Hello');
    });
  });
});
