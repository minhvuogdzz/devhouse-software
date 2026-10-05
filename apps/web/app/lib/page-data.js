import { resolveDefaultPage } from '@devhouse/content';
import { apiClient } from './api-client.js';
import { getLocaleFromUrl } from './i18n.js';

/**
 * Loads one editable page (its sections and SEO) for the current language.
 * Anything the API did not return is filled in from the code defaults, so a page is never blank.
 */
export async function loadPage(key, request) {
  const locale = getLocaleFromUrl(request.url);
  const fallback = resolveDefaultPage(key, locale);

  let page = null;
  try {
    const res = await apiClient(`/pages/${key}?locale=${locale}`);
    page = res.data;
  } catch {
    page = null;
  }

  return {
    sections: { ...fallback.sections, ...(page?.sections || {}) },
    seo: { ...fallback.seo, ...(page?.seo || {}) },
    url: request.url,
    locale,
  };
}

/** Public list from the API, or the fallback list when the API cannot be reached. */
export async function loadList(path, fallback = []) {
  try {
    const res = await apiClient(path);
    return Array.isArray(res.data) ? res.data : fallback;
  } catch {
    return fallback;
  }
}

/** Whether an optional page section should be shown (admins can hide a section). */
export const isShown = section => Boolean(section) && section.visible !== false;
