import { ProductModel } from './product.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';
import { resolveCategoryId } from '../categories/category-ref.js';

const CATEGORY_TYPE_BY_FIELD = { segment: ['product-segment'], category: ['product'] };

export const { service: productService, controller: productController } = createCatalogModule({
  name: 'products',
  routePath: '/products',
  Model: ProductModel,
  searchFields: ['name.vi', 'name.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields: ['createdAt', 'publishedAt', 'order', 'name', 'rating', 'views'],
  defaultSort: 'order',
  populatePublic: [
    { path: 'segment', select: 'name slug order' },
    { path: 'category', select: 'name slug order' },
  ],
  filterFields: ['segment', 'category'],
  filterByLocale: true,
  resolveFilterValue: (field, value) =>
    resolveCategoryId(value, CATEGORY_TYPE_BY_FIELD[field] || []),
});
