import { ServiceModel } from './service.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';

export const { service: servicesService, controller: serviceController } = createCatalogModule({
  name: 'services',
  routePath: '/services',
  Model: ServiceModel,
  searchFields: ['name.vi', 'name.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields: ['createdAt', 'publishedAt', 'order', 'name'],
  defaultSort: 'order',
  populatePublic: ['technologies', 'category'],
});
