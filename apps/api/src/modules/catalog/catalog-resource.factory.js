import { createRepository } from '../../core/db/base-repository.js';
import { cache } from '../../core/cache/index.js';
import { audit } from '../../core/audit/index.js';
import { redirectService } from '../redirects/redirect.service.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../core/errors/index.js';
import { parseListQuery } from '../../core/query/index.js';
import { sendSuccess, sendPaginated } from '../../core/http/index.js';
import { localize } from '@devhouse/content';
import { ERROR_CODES } from '@devhouse/shared';

export function buildAlternates(basePath, slug) {
  if (!slug) return { vi: basePath, en: `/en${basePath}` };
  if (typeof slug === 'string') {
    return {
      vi: `${basePath}/${slug}`,
      en: `/en${basePath}/${slug}`,
    };
  }
  return {
    vi: `${basePath}/${slug.vi || slug.en}`,
    en: `/en${basePath}/${slug.en || slug.vi}`,
  };
}

export function createCatalogModule({
  name,
  routePath,
  Model,
  searchFields = ['name.vi', 'name.en', 'shortDescription.vi', 'shortDescription.en'],
  allowedSortFields = ['createdAt', 'publishedAt', 'order', 'title', 'name'],
  defaultSort = 'order',
  populatePublic = [],
  transformPublic = doc => doc,
  validateInUse = async () => {},
}) {
  const repo = createRepository(Model, {
    searchFields,
    allowedSortFields,
    defaultSort,
  });

  const cacheTag = name;

  const service = {
    async listPublic(rawQuery) {
      const parsed = parseListQuery(rawQuery, {
        allowedSortFields,
        defaultSort,
      });

      const filter = {
        isDeleted: false,
        status: 'published',
        publishedAt: { $lte: new Date() },
      };

      if (rawQuery.featured === 'true') {
        filter.isFeatured = true;
      }

      if (rawQuery.category) {
        filter.category = rawQuery.category;
      }

      if (parsed.search) {
        filter.$or = searchFields.map(f => ({
          [f]: { $regex: parsed.search, $options: 'i' },
        }));
      }

      const total = await Model.countDocuments(filter);
      let query = Model.find(filter).sort(parsed.sort).skip(parsed.skip).limit(parsed.limit);

      for (const pop of populatePublic) {
        query = query.populate(pop);
      }

      const docs = await query.lean();
      const locale = rawQuery.locale || 'vi';

      const transformed = docs.map(doc => {
        const item = transformPublic(doc);
        const localized = localize(item, locale);
        localized.alternates = buildAlternates(routePath, doc.slug);
        return localized;
      });

      return {
        data: transformed,
        pagination: {
          page: parsed.page,
          limit: parsed.limit,
          total,
          totalPages: Math.ceil(total / parsed.limit),
          hasNext: parsed.page < Math.ceil(total / parsed.limit),
          hasPrev: parsed.page > 1,
        },
      };
    },

    async getBySlugPublic(slug, locale = 'vi') {
      const filter = {
        isDeleted: false,
        status: 'published',
        $or: [{ 'slug.vi': slug }, { 'slug.en': slug }, { slug: slug }],
      };

      let query = Model.findOne(filter);
      for (const pop of populatePublic) {
        query = query.populate(pop);
      }

      const doc = await query.lean();
      if (!doc) {
        throw new NotFoundError(`${name} not found`);
      }

      const item = transformPublic(doc);
      const localized = localize(item, locale);
      localized.alternates = buildAlternates(routePath, doc.slug);
      return localized;
    },

    async listAdmin(rawQuery) {
      const parsed = parseListQuery(rawQuery, {
        allowedSortFields: [...allowedSortFields, 'status'],
        defaultSort,
      });

      const filter = {};
      if (rawQuery.deleted === 'true') {
        filter.isDeleted = true;
      } else {
        filter.isDeleted = false;
      }

      if (rawQuery.status) {
        filter.status = rawQuery.status;
      }

      if (rawQuery.category) {
        filter.category = rawQuery.category;
      }

      if (parsed.search) {
        filter.$or = searchFields.map(f => ({
          [f]: { $regex: parsed.search, $options: 'i' },
        }));
      }

      let countQuery = Model.countDocuments(filter);
      let findQuery = Model.find(filter)
        .sort(parsed.sort)
        .skip(parsed.skip)
        .limit(parsed.limit)
        .lean();

      if (rawQuery.deleted === 'true') {
        countQuery = countQuery.setOptions({ withDeleted: true });
        findQuery = findQuery.setOptions({ withDeleted: true });
      }

      const total = await countQuery;
      const docs = await findQuery;

      return {
        data: docs,
        pagination: {
          page: parsed.page,
          limit: parsed.limit,
          total,
          totalPages: Math.ceil(total / parsed.limit),
          hasNext: parsed.page < Math.ceil(total / parsed.limit),
          hasPrev: parsed.page > 1,
        },
      };
    },

    async getByIdAdmin(id) {
      const doc = await repo.findById(id);
      if (!doc) {
        throw new NotFoundError(`${name} not found`);
      }
      return doc;
    },

    async createAdmin(data, hasPublishPermission, _actor) {
      const createData = { ...data };
      if (!hasPublishPermission) {
        createData.status = 'draft';
      }

      const doc = await Model.create(createData);
      cache.invalidateTag(cacheTag);

      await audit.record({
        action: `${name}.create`,
        resource: { type: name, id: doc._id.toString() },
        changes: createData,
      });

      return doc;
    },

    async updateAdmin(id, data, _actor) {
      const existing = await Model.findById(id);
      if (!existing) {
        throw new NotFoundError(`${name} not found`);
      }

      // Check conflict if updatedAt provided
      if (
        data.updatedAt &&
        new Date(data.updatedAt).getTime() !== new Date(existing.updatedAt).getTime()
      ) {
        throw new ConflictError('The record was modified by another user', ERROR_CODES.CONFLICT);
      }

      // Handle automatic redirects on slug change
      if (data.slug) {
        const oldSlugVi = existing.slug?.vi || existing.slug;
        const newSlugVi = data.slug?.vi || data.slug;
        if (oldSlugVi && newSlugVi && oldSlugVi !== newSlugVi) {
          await redirectService.createAutoRedirect(
            `${routePath}/${oldSlugVi}`,
            `${routePath}/${newSlugVi}`,
          );
        }

        const oldSlugEn = existing.slug?.en;
        const newSlugEn = data.slug?.en;
        if (oldSlugEn && newSlugEn && oldSlugEn !== newSlugEn) {
          await redirectService.createAutoRedirect(
            `/en${routePath}/${oldSlugEn}`,
            `/en${routePath}/${newSlugEn}`,
          );
        }
      }

      Object.assign(existing, data);
      await existing.save();
      cache.invalidateTag(cacheTag);

      await audit.record({
        action: `${name}.update`,
        resource: { type: name, id: existing._id.toString() },
        changes: data,
      });

      return existing;
    },

    async updateStatusAdmin(id, { status, publishedAt }, _actor) {
      const existing = await Model.findById(id);
      if (!existing) {
        throw new NotFoundError(`${name} not found`);
      }

      existing.status = status;
      if (publishedAt !== undefined) {
        existing.publishedAt = publishedAt;
      } else if (status === 'published' && !existing.publishedAt) {
        existing.publishedAt = new Date();
      }

      await existing.save();
      cache.invalidateTag(cacheTag);

      await audit.record({
        action: `${name}.status`,
        resource: { type: name, id: existing._id.toString() },
        changes: { status, publishedAt: existing.publishedAt },
      });

      return existing;
    },

    async reorderAdmin(items, _actor) {
      const bulkOps = items.map(item => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { order: item.sortOrder ?? item.order ?? 0 } },
        },
      }));

      if (bulkOps.length > 0) {
        await Model.bulkWrite(bulkOps);
        cache.invalidateTag(cacheTag);

        await audit.record({
          action: `${name}.reorder`,
          resource: { type: name, count: items.length },
        });
      }
    },

    async softDeleteAdmin(id, callerId) {
      const existing = await Model.findById(id);
      if (!existing) {
        throw new NotFoundError(`${name} not found`);
      }

      await validateInUse(existing._id);

      await existing.softDelete(callerId);
      cache.invalidateTag(cacheTag);

      await audit.record({
        action: `${name}.delete`,
        resource: { type: name, id: existing._id.toString() },
      });
    },

    async restoreAdmin(id) {
      const existing = await Model.findOne({ _id: id, isDeleted: true }).setOptions({
        withDeleted: true,
      });
      if (!existing) {
        throw new NotFoundError(`${name} not found or not deleted`);
      }

      // Check slug taken
      if (existing.slug) {
        const slugQuery =
          typeof existing.slug === 'string'
            ? { slug: existing.slug, isDeleted: false, _id: { $ne: id } }
            : {
                $or: [
                  { 'slug.vi': existing.slug.vi, isDeleted: false, _id: { $ne: id } },
                  { 'slug.en': existing.slug.en, isDeleted: false, _id: { $ne: id } },
                ],
              };

        const conflict = await Model.findOne(slugQuery);
        if (conflict) {
          throw new ConflictError(
            'The slug is already in use by another active item',
            ERROR_CODES.SLUG_IN_USE,
          );
        }
      }

      await existing.restore();
      cache.invalidateTag(cacheTag);

      await audit.record({
        action: `${name}.restore`,
        resource: { type: name, id: existing._id.toString() },
      });

      return existing;
    },
  };

  const controller = {
    async list(req, res) {
      const result = await service.listPublic(req.query);
      return sendPaginated(res, result.data, result.pagination);
    },

    async getBySlug(req, res) {
      const result = await service.getBySlugPublic(req.params.slug, req.query.locale);
      return sendSuccess(res, result);
    },

    async adminList(req, res) {
      const result = await service.listAdmin(req.query);
      return sendPaginated(res, result.data, result.pagination);
    },

    async adminGetById(req, res) {
      const result = await service.getByIdAdmin(req.params.id);
      return sendSuccess(res, result);
    },

    async adminCreate(req, res) {
      const hasPublish =
        req.auth?.permissions?.includes('*') || req.auth?.permissions?.includes(`${name}:publish`);
      const callerId = req.auth?.user?._id || req.auth?.user?.id;
      const result = await service.createAdmin(req.body, hasPublish, callerId);
      return sendSuccess(res, result, 201);
    },

    async adminUpdate(req, res) {
      const callerId = req.auth?.user?._id || req.auth?.user?.id;
      const result = await service.updateAdmin(req.params.id, req.body, callerId);
      return sendSuccess(res, result);
    },

    async adminUpdateStatus(req, res) {
      const { status, publishedAt } = req.body;
      if (!['draft', 'published', 'archived'].includes(status)) {
        throw new BadRequestError('Invalid status value');
      }
      const callerId = req.auth?.user?._id || req.auth?.user?.id;
      const result = await service.updateStatusAdmin(
        req.params.id,
        { status, publishedAt },
        callerId,
      );
      return sendSuccess(res, result);
    },

    async adminReorder(req, res) {
      const items = Array.isArray(req.body) ? req.body : req.body.items || [];
      const callerId = req.auth?.user?._id || req.auth?.user?.id;
      await service.reorderAdmin(items, callerId);
      return res.status(204).end();
    },

    async adminDelete(req, res) {
      const callerId = req.auth?.user?._id || req.auth?.user?.id;
      await service.softDeleteAdmin(req.params.id, callerId);
      return res.status(204).end();
    },

    async adminRestore(req, res) {
      const result = await service.restoreAdmin(req.params.id);
      return sendSuccess(res, result);
    },
  };

  return { service, controller };
}
