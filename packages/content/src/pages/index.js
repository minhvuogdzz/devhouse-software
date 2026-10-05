import { localize } from '../resolve.js';
import { homePage } from './home.js';
import { aboutPage } from './about.js';
import { servicesIndexPage } from './services-index.js';
import { packagesIndexPage } from './packages-index.js';
import { productsIndexPage } from './products-index.js';
import { solutionsIndexPage } from './solutions-index.js';
import { projectsIndexPage } from './projects-index.js';
import { serviceDetailPage } from './service-detail.js';
import { projectDetailPage } from './project-detail.js';
import { technologiesIndexPage } from './technologies-index.js';
import { blogIndexPage } from './blog-index.js';
import { careersPage } from './careers.js';
import { contactPage } from './contact.js';
import { privacyPage } from './privacy.js';
import { termsPage } from './terms.js';
import { notFoundPage } from './not-found.js';

export const PAGE_REGISTRY = {
  home: homePage,
  about: aboutPage,
  'services-index': servicesIndexPage,
  'service-detail': serviceDetailPage,
  'packages-index': packagesIndexPage,
  'products-index': productsIndexPage,
  'solutions-index': solutionsIndexPage,
  'projects-index': projectsIndexPage,
  'project-detail': projectDetailPage,
  'technologies-index': technologiesIndexPage,
  'blog-index': blogIndexPage,
  careers: careersPage,
  contact: contactPage,
  privacy: privacyPage,
  terms: termsPage,
  'not-found': notFoundPage,
};

export const getPageDefinition = key => PAGE_REGISTRY[key] ?? null;

/**
 * Code-only version of a page for one locale (no database). Used as the last-resort
 * fallback when the API cannot be reached, so a page is never blank.
 */
export function resolveDefaultPage(key, locale) {
  const def = PAGE_REGISTRY[key];
  if (!def) return { sections: {}, seo: {} };
  const sections = Object.fromEntries(def.sections.map(sec => [sec.key, sec.defaults]));
  return { sections: localize(sections, locale), seo: localize(def.seo ?? {}, locale) };
}

export * from './home.js';
export * from './about.js';
export * from './services-index.js';
export * from './packages-index.js';
export * from './products-index.js';
export * from './solutions-index.js';
export * from './projects-index.js';
export * from './service-detail.js';
export * from './project-detail.js';
export * from './technologies-index.js';
export * from './blog-index.js';
export * from './careers.js';
export * from './contact.js';
export * from './privacy.js';
export * from './terms.js';
export * from './not-found.js';
