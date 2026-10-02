import { DEFAULT_LOCALE } from '@devhouse/shared';

export function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function resolveContent(defaults, overrides) {
  if (overrides === undefined || overrides === null) {
    return defaults;
  }

  if (Array.isArray(defaults) || Array.isArray(overrides)) {
    // Array overrides completely replace default arrays
    return Array.isArray(overrides) ? overrides : defaults;
  }

  if (isPlainObject(defaults) && isPlainObject(overrides)) {
    const result = {};
    for (const key of Object.keys(defaults)) {
      result[key] = resolveContent(defaults[key], overrides[key]);
    }
    return result;
  }

  return overrides;
}

export function isLocalizedLeaf(val) {
  return isPlainObject(val) && 'vi' in val && 'en' in val && Object.keys(val).length === 2;
}

export function localize(content, locale = DEFAULT_LOCALE) {
  if (content === null || content === undefined) {
    return content;
  }

  if (isLocalizedLeaf(content)) {
    return content[locale] ?? content[DEFAULT_LOCALE] ?? '';
  }

  if (Array.isArray(content)) {
    return content.map(item => localize(item, locale));
  }

  if (isPlainObject(content)) {
    const localizedObj = {};
    for (const [key, value] of Object.entries(content)) {
      localizedObj[key] = localize(value, locale);
    }
    return localizedObj;
  }

  return content;
}
