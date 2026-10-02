import { describe, it, expect } from 'vitest';
import {
  resolveContent,
  localize,
  PAGE_REGISTRY,
  defaultSettings,
  defaultNavigation,
  defaultServices,
  defaultSolutions,
  defaultTechnologies,
  defaultCategories,
  resolveDefaultPage,
} from '../src/index.js';

describe('@devhouse/content', () => {
  describe('resolveContent', () => {
    it('merges sparse overrides on top of defaults', () => {
      const defaults = {
        title: { vi: 'Mặc định', en: 'Default' },
        visible: true,
        order: 1,
      };
      const overrides = {
        title: { vi: 'Tiêu đề mới' },
      };

      const resolved = resolveContent(defaults, overrides);
      expect(resolved.title.vi).toBe('Tiêu đề mới');
      expect(resolved.title.en).toBe('Default');
      expect(resolved.visible).toBe(true);
      expect(resolved.order).toBe(1);
    });

    it('replaces arrays as a whole rather than merging elements', () => {
      const defaults = {
        items: ['a', 'b', 'c'],
      };
      const overrides = {
        items: ['x', 'y'],
      };

      const resolved = resolveContent(defaults, overrides);
      expect(resolved.items).toEqual(['x', 'y']);
    });

    it('returns defaults when overrides are null or undefined', () => {
      const defaults = { heading: { vi: 'Chào', en: 'Hi' } };
      expect(resolveContent(defaults, undefined)).toEqual(defaults);
      expect(resolveContent(defaults, null)).toEqual(defaults);
    });
  });

  describe('localize', () => {
    it('flattens localized leaves to the specified locale', () => {
      const content = {
        title: { vi: 'Tiêu đề', en: 'Title' },
        description: { vi: 'Mô tả', en: 'Description' },
        count: 5,
        list: [{ label: { vi: 'Mục 1', en: 'Item 1' } }],
      };

      const vi = localize(content, 'vi');
      expect(vi.title).toBe('Tiêu đề');
      expect(vi.description).toBe('Mô tả');
      expect(vi.count).toBe(5);
      expect(vi.list[0].label).toBe('Mục 1');

      const en = localize(content, 'en');
      expect(en.title).toBe('Title');
      expect(en.description).toBe('Description');
      expect(en.count).toBe(5);
      expect(en.list[0].label).toBe('Item 1');
    });
  });

  describe('Settings and Navigation defaults', () => {
    it('provides bilingual defaults for settings and navigation', () => {
      expect(defaultSettings.companyName.vi).toBe('Dev House Software');
      expect(defaultSettings.companyName.en).toBe('Dev House Software');
      expect(defaultNavigation.header.length).toBeGreaterThan(0);
      expect(defaultNavigation.footer.columns.length).toBeGreaterThan(0);
      expect(defaultCategories.length).toBeGreaterThan(0);
    });
  });

  describe('Page definitions validation', () => {
    it('every registered page section defaults satisfy its schema', () => {
      for (const [pageKey, pageDef] of Object.entries(PAGE_REGISTRY)) {
        expect(pageDef.key).toBe(pageKey);
        for (const section of pageDef.sections) {
          const parsed = section.schema.safeParse(section.defaults);
          expect(
            parsed.success,
            `Section "${section.key}" in page "${pageKey}" failed schema check: ${JSON.stringify(parsed.error?.issues)}`,
          ).toBe(true);
        }
      }
    });
  });

  describe('Placeholder data policy (Rule P3)', () => {
    it('default catalog contains no image URLs or placeholder images', () => {
      for (const service of defaultServices) {
        expect(service.image).toBeUndefined();
      }
      for (const tech of defaultTechnologies) {
        expect(tech.icon).not.toMatch(/placeholder|via\.placeholder|picsum/i);
      }
    });

    it('default services and solutions provide valid Vietnamese and English copy', () => {
      for (const service of defaultServices) {
        expect(service.name.vi.length).toBeGreaterThan(0);
        expect(service.name.en.length).toBeGreaterThan(0);
        expect(service.shortDescription.vi.length).toBeGreaterThan(0);
        expect(service.shortDescription.en.length).toBeGreaterThan(0);
      }

      for (const solution of defaultSolutions) {
        expect(solution.name.vi.length).toBeGreaterThan(0);
        expect(solution.name.en.length).toBeGreaterThan(0);
        expect(solution.shortDescription.vi.length).toBeGreaterThan(0);
        expect(solution.shortDescription.en.length).toBeGreaterThan(0);
      }
    });
  });
  describe('company details and About page', () => {
    it('uses the real company contact details', () => {
      expect(defaultSettings.contactEmail).toBe('devhousesoftware.inc@gmail.com');
      expect(defaultSettings.hotline.replace(/\s/g, '')).toBe('0869528304');
      expect(defaultSettings.address.vi).toContain('Tây Hồ');
      expect(defaultSettings.address.vi).toContain('Hà Nội');
    });

    it('does not ship invented company data', () => {
      expect(defaultSettings.taxCode).toBe('');
      expect(defaultSettings.socialLinks).toEqual([]);
    });

    it('describes the org chart as a tree with all six leaders in both languages', () => {
      for (const locale of ['vi', 'en']) {
        const { nodes } = resolveDefaultPage('about', locale).sections.leadership;
        const people = nodes.flatMap(n => n.members.map(m => m.name));
        expect(people).toEqual([
          'Dương Minh Vương',
          'Nguyễn Thành Lâm',
          'Lưu Công Hải',
          'Nguyễn Hữu Trọng Anh',
          'Nguyễn Đức Việt',
          'Lê Trương Nguyễn Hoàng',
        ]);
        const ids = new Set(nodes.map(n => n.id));
        const roots = nodes.filter(n => n.parent === '');
        expect(roots).toHaveLength(1);
        for (const node of nodes) {
          if (node.parent !== '') expect(ids.has(node.parent)).toBe(true);
          for (const m of node.members) expect(m.role.length).toBeGreaterThan(0);
        }
      }
    });

    it('has service terms in both languages', () => {
      for (const locale of ['vi', 'en']) {
        const terms = resolveDefaultPage('about', locale).sections.serviceTerms;
        expect(terms.items.length).toBeGreaterThanOrEqual(5);
        expect(terms.linkLabel.length).toBeGreaterThan(0);
      }
    });
  });
});
