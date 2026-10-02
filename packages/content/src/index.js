import { PAGE_REGISTRY } from './pages/index.js';
import { defaultCategories } from './catalog/categories.js';
import { defaultTechnologies } from './catalog/technologies.js';
import { defaultServices } from './catalog/services.js';
import { defaultSolutions } from './catalog/solutions.js';

export * from './define.js';
export * from './resolve.js';
export * from './settings.js';
export * from './navigation.js';
export * from './pages/index.js';
export * from './catalog/index.js';

export const defaultPages = PAGE_REGISTRY;
export const defaultCatalog = {
  categories: defaultCategories,
  technologies: defaultTechnologies,
  services: defaultServices,
  solutions: defaultSolutions,
  projects: [],
};
