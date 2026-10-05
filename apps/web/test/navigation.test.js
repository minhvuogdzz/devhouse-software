import { describe, it, expect } from 'vitest';
import { defaultNavigation, localize } from '@devhouse/content';
import { isActivePath, resolveNavigation, withLocale } from '../app/lib/navigation.js';

describe('withLocale', () => {
  it('prefixes our own pages for English only', () => {
    expect(withLocale('/services', 'vi')).toBe('/services');
    expect(withLocale('/services', 'en')).toBe('/en/services');
    expect(withLocale('/', 'en')).toBe('/en');
    expect(withLocale('/', 'vi')).toBe('/');
    expect(withLocale('/#process', 'en')).toBe('/en/#process');
    expect(withLocale('/#process', 'vi')).toBe('/#process');
  });

  it('leaves outside links alone', () => {
    expect(withLocale('https://example.com/a', 'en')).toBe('https://example.com/a');
    expect(withLocale('mailto:hi@example.com', 'en')).toBe('mailto:hi@example.com');
  });
});

describe('resolveNavigation', () => {
  it('uses the code defaults when the API sent no menu', () => {
    const { header, columns } = resolveNavigation(null, 'vi');
    expect(header.map(item => item.path)).toEqual(defaultNavigation.header.map(item => item.path));
    expect(header[0].label).toBe('Dịch vụ');
    expect(columns.length).toBeGreaterThan(0);
  });

  it('hides items the admin switched off and sorts by order', () => {
    const site = {
      navigation: {
        header: [
          { id: 'b', label: 'B', path: '/b', order: 2, visible: true },
          { id: 'hidden', label: 'Hidden', path: '/h', order: 0, visible: false },
          { id: 'a', label: 'A', path: '/a', order: 1 },
        ],
        footer: { columns: [{ title: 'Empty', links: [] }] },
      },
    };
    const { header, columns } = resolveNavigation(site, 'en');
    expect(header.map(item => item.id)).toEqual(['a', 'b']);
    expect(columns).toEqual([]);
  });

  it('gives English labels for English pages', () => {
    const site = { navigation: localize(defaultNavigation, 'en') };
    expect(resolveNavigation(site, 'en').header[0].label).toBe('Services');
  });
});

describe('isActivePath', () => {
  const at = (pathname, hash = '') => ({ pathname, hash });

  it('matches a page and the pages below it', () => {
    expect(isActivePath('/services', 'vi', at('/services'))).toBe(true);
    expect(isActivePath('/services', 'vi', at('/services/thiet-ke-website'))).toBe(true);
    expect(isActivePath('/services', 'vi', at('/packages'))).toBe(false);
    expect(isActivePath('/services', 'en', at('/en/services'))).toBe(true);
  });

  it('only marks the home page active on the home page', () => {
    expect(isActivePath('/', 'vi', at('/'))).toBe(true);
    expect(isActivePath('/', 'vi', at('/services'))).toBe(false);
  });

  it('treats an anchor as active only while its hash is in the address', () => {
    expect(isActivePath('/#process', 'vi', at('/', '#process'))).toBe(true);
    expect(isActivePath('/#process', 'vi', at('/'))).toBe(false);
    expect(isActivePath('/#process', 'vi', at('/services', '#process'))).toBe(false);
  });
});
