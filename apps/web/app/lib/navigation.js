import { defaultNavigation, localize } from '@devhouse/content';

export const localePrefix = locale => (locale === 'en' ? '/en' : '');

export const isExternalUrl = value =>
  /^(https?:)?\/\//i.test(value || '') || /^(mailto|tel):/i.test(value || '');

/** '/services' -> '/en/services' for English; external links and anchors on other hosts are left alone. */
export function withLocale(path, locale) {
  const prefix = localePrefix(locale);
  if (!path) return prefix || '/';
  if (isExternalUrl(path) || !path.startsWith('/')) return path;
  if (path === '/') return prefix || '/';
  if (path.startsWith('/#')) return `${prefix || ''}/${path.slice(1)}`;
  return `${prefix}${path}`;
}

/**
 * Menus managed in Admin → Navigation, ready to render: hidden items removed, ordered, and
 * falling back to the code defaults when the API sent nothing.
 */
export function resolveNavigation(site, locale) {
  const nav = site?.navigation?.header ? site.navigation : localize(defaultNavigation, locale);

  const header = [...(nav.header || [])]
    .filter(item => item && item.visible !== false && item.label && item.path)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const columns = (nav.footer?.columns || [])
    .map(column => ({
      ...column,
      links: (column.links || []).filter(
        link => link && link.visible !== false && link.label && link.path,
      ),
    }))
    .filter(column => column.title && column.links.length > 0);

  return { header, columns };
}

/** Whether a menu entry points at the page being viewed (anchors only match when the hash matches). */
export function isActivePath(itemPath, locale, location) {
  const target = withLocale(itemPath, locale);
  if (isExternalUrl(target)) return false;
  const [pathPart, hash] = target.split('#');
  const normalize = value => (value.length > 1 ? value.replace(/\/+$/, '') : value) || '/';
  const current = normalize(location.pathname);
  const wanted = normalize(pathPart || '/');
  if (hash) return current === wanted && location.hash === `#${hash}`;
  if (wanted === normalize(localePrefix(locale) || '/'))
    return current === wanted && !location.hash;
  return current === wanted || current.startsWith(`${wanted}/`);
}
