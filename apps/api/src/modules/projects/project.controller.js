import { ProjectModel } from './project.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';

export const { service: projectsService, controller: projectController } = createCatalogModule({
  name: 'projects',
  routePath: '/projects',
  Model: ProjectModel,
  searchFields: ['title.vi', 'title.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields: ['createdAt', 'publishedAt', 'order', 'title'],
  defaultSort: 'order',
  populatePublic: ['services', 'technologies', 'category'],
  transformPublic: doc => {
    const item = { ...doc };
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
