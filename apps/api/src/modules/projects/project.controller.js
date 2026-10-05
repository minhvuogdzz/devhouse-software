import { ProjectModel } from './project.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';
import { resolveCategoryId } from '../categories/category-ref.js';

const CATEGORY_TYPE_BY_FIELD = { segment: ['project-segment'], category: ['project'] };

export const { service: projectsService, controller: projectController } = createCatalogModule({
  name: 'projects',
  routePath: '/projects',
  Model: ProjectModel,
  searchFields: ['title.vi', 'title.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields: ['createdAt', 'publishedAt', 'order', 'title', 'rating', 'views'],
  defaultSort: 'order',
  populatePublic: [
    { path: 'segment', select: 'name slug order' },
    { path: 'category', select: 'name slug order' },
    { path: 'services', select: 'name slug' },
    { path: 'technologies', select: 'name slug' },
  ],
  filterFields: ['segment', 'category'],
  filterByLocale: true,
  resolveFilterValue: (field, value) =>
    resolveCategoryId(value, CATEGORY_TYPE_BY_FIELD[field] || []),
  transformPublic: doc => {
    const item = { ...doc };
    // Projects made before card pictures existed only have a cover image
    if (!item.thumbnails?.length && item.coverImage?.url) {
      item.thumbnails = [item.coverImage];
    }
    if (item.client?.isConfidential) {
      item.client = {
        ...item.client,
        name: '',
        logo: {},
      };
    }
    return item;
  },
});
