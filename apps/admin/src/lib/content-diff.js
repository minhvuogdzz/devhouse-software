/**
 * Page and settings content is stored as sparse overrides on top of code defaults.
 * The editors work on the full resolved content, so before saving we keep only what differs
 * from the defaults. Fields left alone keep following the defaults when those improve.
 */

const isPlainObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

/** A text in both languages ({ vi, en }). It is saved whole, so the two languages stay in step. */
const isLocalizedLeaf = value =>
  isPlainObject(value) && 'vi' in value && 'en' in value && Object.keys(value).length === 2;

/** A button or link ({ label, url, target }). Its text and address belong together. */
const isLink = value =>
  isPlainObject(value) && isLocalizedLeaf(value.label) && typeof value.url === 'string';

const isWhole = value => isLocalizedLeaf(value) || isLink(value);

export function isEqual(a, b) {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => isEqual(item, b[index]));
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].every(key => isEqual(a[key], b[key]));
  }
  return false;
}

/**
 * Returns only the parts of `edited` that differ from `defaults`.
 * Arrays, bilingual texts and links are replaced as a whole.
 */
export function diffAgainstDefaults(edited, defaults) {
  if (isEqual(edited, defaults)) return undefined;
  if (isPlainObject(edited) && isPlainObject(defaults) && !isWhole(edited)) {
    const out = {};
    for (const key of Object.keys(edited)) {
      const part = diffAgainstDefaults(edited[key], defaults[key]);
      if (part !== undefined) out[key] = part;
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
  return edited;
}

/** Diffs every section of a page and drops the ones that match their defaults. */
export function diffSections(sections, defaults) {
  const out = {};
  for (const key of Object.keys(sections || {})) {
    const part = diffAgainstDefaults(sections[key], defaults?.[key]);
    if (part !== undefined) out[key] = part;
  }
  return out;
}
