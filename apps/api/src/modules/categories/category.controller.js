import { CategoryModel } from './category.model.js';
import { ServiceModel } from '../services/service.model.js';
import { ProjectModel } from '../projects/project.model.js';
import { TechnologyModel } from '../technologies/technology.model.js';
import { sendSuccess } from '../../core/http/index.js';
import { cache } from '../../core/cache/index.js';
import { audit } from '../../core/audit/index.js';
import { NotFoundError, ConflictError } from '../../core/errors/index.js';
import { localize } from '@devhouse/content';

export const categoryController = {
  async listPublic(req, res) {
    const { type, locale = 'vi' } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const categories = await CategoryModel.find(filter).sort({ order: 1 }).lean();
    const localized = categories.map(cat => localize(cat, locale));
    return sendSuccess(res, localized);
  },

  async adminList(req, res) {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;

    const categories = await CategoryModel.find(filter).sort({ order: 1 }).lean();

    // Attach item usage counts
    const withCounts = await Promise.all(
      categories.map(async cat => {
        let count = 0;
        if (cat.type === 'service') {
          count = await ServiceModel.countDocuments({ category: cat._id, isDeleted: false });
        } else if (cat.type === 'project') {
          count = await ProjectModel.countDocuments({ category: cat._id, isDeleted: false });
        } else if (cat.type === 'technology') {
          count = await TechnologyModel.countDocuments({
            $or: [{ category: cat._id }, { categorySlug: cat.slug?.vi }],
            isDeleted: false,
          });
        }
        return { ...cat, itemCount: count };
      }),
    );

    return sendSuccess(res, withCounts);
  },

  async adminCreate(req, res) {
    const category = await CategoryModel.create(req.body);
    cache.invalidateTag('categories');

    await audit.record({
      action: 'category.create',
      resource: { type: 'category', id: category._id.toString(), label: category.name?.vi || '' },
      changes: req.body,
    });

    return sendSuccess(res, category, 201);
  },

  async adminUpdate(req, res) {
    const { id } = req.params;
    const existing = await CategoryModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    Object.assign(existing, req.body);
    await existing.save();
    cache.invalidateTag('categories');

    await audit.record({
      action: 'category.update',
      resource: { type: 'category', id: existing._id.toString(), label: existing.name?.vi || '' },
      changes: req.body,
    });

    return sendSuccess(res, existing);
  },

  async adminReorder(req, res) {
    const items = Array.isArray(req.body) ? req.body : req.body.items || [];
    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.sortOrder ?? item.order ?? 0 } },
      },
    }));

    if (bulkOps.length > 0) {
      await CategoryModel.bulkWrite(bulkOps);
      cache.invalidateTag('categories');

      await audit.record({
        action: 'category.reorder',
        resource: { type: 'category', count: items.length },
      });
    }

    return res.status(204).end();
  },

  async adminDelete(req, res) {
    const { id } = req.params;
    const existing = await CategoryModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    // In-use check
    const [serviceCount, projectCount, techCount] = await Promise.all([
      ServiceModel.countDocuments({ category: id, isDeleted: false }),
      ProjectModel.countDocuments({ category: id, isDeleted: false }),
      TechnologyModel.countDocuments({
        $or: [{ category: id }, { categorySlug: existing.slug?.vi }],
        isDeleted: false,
      }),
    ]);

    const totalUsage = serviceCount + projectCount + techCount;
    if (totalUsage > 0) {
      throw new ConflictError(
        `Category is in use by ${totalUsage} items and cannot be deleted`,
        'RESOURCE_IN_USE',
      );
    }

    await CategoryModel.findByIdAndDelete(id);
    cache.invalidateTag('categories');

    await audit.record({
      action: 'category.delete',
      resource: { type: 'category', id: existing._id.toString(), label: existing.name?.vi || '' },
    });

    return res.status(204).end();
  },
};
