import { PackageModel } from './package.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';

export const { service: packageService, controller: packageController } = createCatalogModule({
  name: 'packages',
  routePath: '/packages',
  Model: PackageModel,
  searchFields: ['name.vi', 'name.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields: ['createdAt', 'publishedAt', 'order', 'name'],
  defaultSort: 'order',
  filterFields: [],
  filterByLocale: true,
});
