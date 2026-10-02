import { SolutionModel } from './solution.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';

export const { service: solutionsService, controller: solutionController } = createCatalogModule({
  name: 'solutions',
  routePath: '/solutions',
  Model: SolutionModel,
  searchFields: ['name.vi', 'name.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields: ['createdAt', 'publishedAt', 'order', 'name'],
  defaultSort: 'order',
  populatePublic: ['services', 'technologies'],
});
