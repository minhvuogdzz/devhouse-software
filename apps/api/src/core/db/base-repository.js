import { parseListQuery } from '../query/index.js';

export const createRepository = (model, repositoryOptions = {}) => {
  return {
    model,

    async find(filter = {}, options = {}) {
      const {
        sort = { createdAt: -1 },
        skip = 0,
        limit = 50,
        populate = null,
        select = null,
        lean = true,
      } = options;

      let query = model.find(filter).sort(sort).skip(skip).limit(limit);

      if (select) query = query.select(select);
      if (populate) query = query.populate(populate);
      if (lean) query = query.lean();

      return query.exec();
    },

    async findPaginated(rawQuery = {}, extraFilter = {}, options = {}) {
      const { filter, sort, skip, limit, page } = parseListQuery(rawQuery, {
        ...repositoryOptions,
        ...options,
      });

      const mergedFilter = { ...filter, ...extraFilter };

      const [data, total] = await Promise.all([
        this.find(mergedFilter, {
          sort,
          skip,
          limit,
          populate: options.populate,
          select: options.select,
          lean: options.lean ?? true,
        }),
        model.countDocuments(mergedFilter),
      ]);

      const totalPages = Math.ceil(total / limit) || 1;
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    },

    async findOne(filter = {}, options = {}) {
      let query = model.findOne(filter);
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      if (options.lean ?? true) query = query.lean();
      return query.exec();
    },

    async findById(id, options = {}) {
      let query = model.findById(id);
      if (options.select) query = query.select(options.select);
      if (options.populate) query = query.populate(options.populate);
      if (options.lean ?? true) query = query.lean();
      return query.exec();
    },

    async create(data) {
      return model.create(data);
    },

    async updateById(id, data, options = { new: true, runValidators: true }) {
      return model.findByIdAndUpdate(id, data, options);
    },

    async softDeleteById(id, actorId = null) {
      const doc = await model.findById(id);
      if (!doc) return null;
      if (typeof doc.softDelete === 'function') {
        return doc.softDelete(actorId);
      }
      return model.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date(), deletedBy: actorId },
        { new: true },
      );
    },

    async restoreById(id) {
      return model.findByIdAndUpdate(
        id,
        { isDeleted: false, deletedAt: null, deletedBy: null },
        { new: true },
      );
    },

    async deleteById(id) {
      return model.findByIdAndDelete(id);
    },

    async count(filter = {}) {
      return model.countDocuments(filter);
    },
  };
};
