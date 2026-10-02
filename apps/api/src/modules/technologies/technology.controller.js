import { TechnologyModel } from './technology.model.js';
import { ServiceModel } from '../services/service.model.js';
import { SolutionModel } from '../solutions/solution.model.js';
import { ProjectModel } from '../projects/project.model.js';
import { CategoryModel } from '../categories/category.model.js';
import { createCatalogModule } from '../catalog/catalog-resource.factory.js';
import { ConflictError } from '../../core/errors/index.js';
import { sendSuccess } from '../../core/http/index.js';
import { localize } from '@devhouse/content';

export const { service: technologiesService, controller: baseTechnologyController } =
  createCatalogModule({
    name: 'technologies',
    routePath: '/technologies',
    Model: TechnologyModel,
    searchFields: ['name', 'description.vi', 'description.en'],
    allowedSortFields: ['createdAt', 'order', 'name'],
    defaultSort: 'order',
    populatePublic: ['category'],
    validateInUse: async id => {
      const [serviceCount, solutionCount, projectCount] = await Promise.all([
        ServiceModel.countDocuments({ technologies: id, isDeleted: false }),
        SolutionModel.countDocuments({ technologies: id, isDeleted: false }),
        ProjectModel.countDocuments({ technologies: id, isDeleted: false }),
      ]);

      const total = serviceCount + solutionCount + projectCount;
      if (total > 0) {
        throw new ConflictError(
          `Technology is in use by ${total} items (${serviceCount} services, ${solutionCount} solutions, ${projectCount} projects)`,
          'RESOURCE_IN_USE',
        );
      }
    },
  });

export const technologyController = {
  ...baseTechnologyController,

  async list(req, res) {
    if (req.query.group === 'category') {
      const locale = req.query.locale || 'vi';
      const categories = await CategoryModel.find({ type: 'technology' }).sort({ order: 1 }).lean();
      const technologies = await TechnologyModel.find({
        status: 'published',
        isDeleted: false,
      })
        .sort({ order: 1 })
        .lean();

      const grouped = categories.map(cat => {
        const catItems = technologies.filter(
          t => t.categorySlug === cat.slug?.vi || t.category?.toString() === cat._id.toString(),
        );

        return {
          category: localize(cat, locale),
          items: catItems.map(item => localize(item, locale)),
        };
      });

      return sendSuccess(res, grouped);
    }

    return baseTechnologyController.list(req, res);
  },
};
