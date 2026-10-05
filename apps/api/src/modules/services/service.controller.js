import mongoose from 'mongoose';
import { ServiceModel } from './service.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';
import { ConflictError } from '../../core/errors/index.js';

const NO_MATCH = new mongoose.Types.ObjectId('000000000000000000000000');

/**
 * ?parent= takes "none" (only the top-level groups), the id of a group, or a group's slug.
 * An unknown slug matches nothing instead of being ignored.
 */
async function resolveParent(value) {
  if (value === 'none') return null;
  if (typeof value !== 'string') return NO_MATCH;
  if (/^[a-f\d]{24}$/i.test(value)) return new mongoose.Types.ObjectId(value);
  const group = await ServiceModel.findOne({
    $or: [{ 'slug.vi': value }, { 'slug.en': value }],
  })
    .select('_id')
    .lean();
  return group ? group._id : NO_MATCH;
}

export const { service: servicesService, controller: serviceController } = createCatalogModule({
  name: 'services',
  routePath: '/services',
  Model: ServiceModel,
  searchFields: ['name.vi', 'name.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields: ['createdAt', 'publishedAt', 'order', 'name'],
  defaultSort: 'order',
  populatePublic: [
    'technologies',
    { path: 'category', select: 'name slug' },
    { path: 'parent', select: 'name slug' },
  ],
  filterFields: ['category', 'parent'],
  resolveFilterValue: (field, value) => (field === 'parent' ? resolveParent(value) : value),
  filterByLocale: true,
  // A group that still has services inside cannot be removed, so none of them is left without a page
  validateInUse: async id => {
    const inside = await ServiceModel.countDocuments({ parent: id, isDeleted: false });
    if (inside > 0) {
      throw new ConflictError(
        `This group still has ${inside} services inside it. Move or delete them first.`,
        'RESOURCE_IN_USE',
      );
    }
  },
});
