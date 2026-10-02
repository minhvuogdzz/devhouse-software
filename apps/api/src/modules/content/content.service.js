import {
  PAGE_REGISTRY,
  defaultSettings,
  defaultNavigation,
  resolveContent,
  localize,
} from '@devhouse/content';
import { PageModel } from './page.model.js';
import { SettingsModel } from '../settings/settings.model.js';
import { NavigationModel } from '../navigation/navigation.model.js';
import { cache } from '../../core/cache/index.js';
import { audit } from '../../core/audit/index.js';
import { NotFoundError } from '../../core/errors/index.js';

export function getPageDefaults(pageDef) {
  const defaults = {};
  for (const section of pageDef.sections) {
    defaults[section.key] = section.defaults;
  }
  return defaults;
}

export const contentService = {
  async getPage(key, locale = null) {
    const pageDef = PAGE_REGISTRY[key];
    if (!pageDef) {
      throw new NotFoundError(`Page '${key}' not found`);
    }

    const cacheKey = `page:${key}:${locale || 'raw'}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const pageDoc = await PageModel.findOne({ key }).lean();
    const defaults = getPageDefaults(pageDef);
    const overrides = pageDoc?.sections || {};
    const resolvedSections = resolveContent(defaults, overrides);

    const seo = pageDoc?.seo?.title?.vi ? pageDoc.seo : pageDef.seo;

    let result = {
      key,
      sections: resolvedSections,
      seo,
    };

    if (locale) {
      result = {
        key,
        sections: localize(resolvedSections, locale),
        seo: localize(seo, locale),
      };
    }

    cache.set(cacheKey, result, { tags: ['pages', `page:${key}`], ttlMs: 60000 });
    return result;
  },

  async getSite(locale = null) {
    const cacheKey = `site:${locale || 'raw'}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const [settingsDoc, navDoc] = await Promise.all([
      SettingsModel.findOne({ key: 'global' }).lean(),
      NavigationModel.findOne({ key: 'main' }).lean(),
    ]);

    const settingsOverrides = settingsDoc?.data || {};
    const resolvedSettings = resolveContent(defaultSettings, settingsOverrides);

    const navOverrides = {
      header: navDoc?.header || defaultNavigation.header,
      footer: navDoc?.footer || defaultNavigation.footer,
    };

    let result = {
      settings: resolvedSettings,
      navigation: navOverrides,
    };

    if (locale) {
      result = {
        settings: localize(resolvedSettings, locale),
        navigation: localize(navOverrides, locale),
      };
    }

    cache.set(cacheKey, result, { tags: ['site', 'settings', 'navigation'], ttlMs: 60000 });
    return result;
  },

  async listAdminPages() {
    const pageDocs = await PageModel.find().lean();
    const docMap = new Map(pageDocs.map(d => [d.key, d]));

    return Object.keys(PAGE_REGISTRY).map(key => {
      const pageDef = PAGE_REGISTRY[key];
      const doc = docMap.get(key);
      const overrides = doc?.sections || {};

      return {
        key,
        title: pageDef.title,
        overriddenSections: Object.keys(overrides).filter(
          s => Object.keys(overrides[s] || {}).length > 0,
        ),
        updatedAt: doc?.updatedAt || null,
      };
    });
  },

  async getAdminPage(key) {
    const pageDef = PAGE_REGISTRY[key];
    if (!pageDef) {
      throw new NotFoundError(`Page '${key}' not found`);
    }

    const pageDoc = await PageModel.findOne({ key }).lean();
    const defaults = getPageDefaults(pageDef);
    const overrides = pageDoc?.sections || {};
    const resolved = resolveContent(defaults, overrides);

    return {
      key,
      title: pageDef.title,
      definition: {
        key: pageDef.key,
        title: pageDef.title,
        sections: pageDef.sections.map(s => ({
          key: s.key,
          label: s.label,
          fields: s.fields,
        })),
      },
      defaults,
      overrides,
      resolved,
      seo: pageDoc?.seo || pageDef.seo,
      updatedAt: pageDoc?.updatedAt || null,
    };
  },

  async updateAdminPage(key, { sections, seo }) {
    const pageDef = PAGE_REGISTRY[key];
    if (!pageDef) {
      throw new NotFoundError(`Page '${key}' not found`);
    }

    const updateData = {};
    if (sections !== undefined) updateData.sections = sections;
    if (seo !== undefined) updateData.seo = seo;

    await PageModel.findOneAndUpdate({ key }, { $set: updateData }, { upsert: true, new: true });

    cache.invalidateTag(`page:${key}`);
    cache.invalidateTag('pages');

    await audit.record({
      action: 'page.update',
      resource: { type: 'page', id: key, label: key },
      changes: { sections: updateData.sections, seo: updateData.seo },
    });

    return this.getAdminPage(key);
  },

  async resetAdminPageSection(key, sectionKey) {
    const pageDef = PAGE_REGISTRY[key];
    if (!pageDef) {
      throw new NotFoundError(`Page '${key}' not found`);
    }

    await PageModel.updateOne({ key }, { $unset: { [`sections.${sectionKey}`]: 1 } });

    cache.invalidateTag(`page:${key}`);
    cache.invalidateTag('pages');

    await audit.record({
      action: 'page.reset_section',
      resource: { type: 'page', id: key, label: `${key}:${sectionKey}` },
    });

    return this.getAdminPage(key);
  },

  async resetAdminPage(key) {
    const pageDef = PAGE_REGISTRY[key];
    if (!pageDef) {
      throw new NotFoundError(`Page '${key}' not found`);
    }

    await PageModel.updateOne({ key }, { $set: { sections: {} } });

    cache.invalidateTag(`page:${key}`);
    cache.invalidateTag('pages');

    await audit.record({
      action: 'page.reset',
      resource: { type: 'page', id: key, label: key },
    });

    return this.getAdminPage(key);
  },

  async getAdminSettings() {
    const doc = await SettingsModel.findOne({ key: 'global' }).lean();
    const overrides = doc?.data || {};
    const resolved = resolveContent(defaultSettings, overrides);

    return {
      defaults: defaultSettings,
      overrides,
      resolved,
      updatedAt: doc?.updatedAt || null,
    };
  },

  async updateAdminSettings(data) {
    const doc = await SettingsModel.findOneAndUpdate(
      { key: 'global' },
      { $set: { data } },
      { upsert: true, new: true },
    );

    cache.invalidateTag('settings');
    cache.invalidateTag('site');

    await audit.record({
      action: 'settings.update',
      resource: { type: 'settings', id: 'global', label: 'Global Site Settings' },
      changes: data,
    });

    return {
      defaults: defaultSettings,
      overrides: doc.data,
      resolved: resolveContent(defaultSettings, doc.data),
      updatedAt: doc.updatedAt,
    };
  },

  async getAdminNavigation(key = 'main') {
    const doc = await NavigationModel.findOne({ key }).lean();
    return {
      key,
      defaults: defaultNavigation,
      header: doc?.header || defaultNavigation.header,
      footer: doc?.footer || defaultNavigation.footer,
      updatedAt: doc?.updatedAt || null,
    };
  },

  async updateAdminNavigation(key = 'main', { header, footer }) {
    const updateData = {};
    if (header !== undefined) updateData.header = header;
    if (footer !== undefined) updateData.footer = footer;

    const doc = await NavigationModel.findOneAndUpdate(
      { key },
      { $set: updateData },
      { upsert: true, new: true },
    );

    cache.invalidateTag('navigation');
    cache.invalidateTag('site');

    await audit.record({
      action: 'navigation.update',
      resource: { type: 'navigation', id: key, label: `Navigation: ${key}` },
      changes: updateData,
    });

    return {
      key,
      defaults: defaultNavigation,
      header: doc.header,
      footer: doc.footer,
      updatedAt: doc.updatedAt,
    };
  },
};
