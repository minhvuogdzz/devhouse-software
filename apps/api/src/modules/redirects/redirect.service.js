import { RedirectModel } from './redirect.model.js';
import { cache } from '../../core/cache/index.js';
import { logger } from '../../core/logger/index.js';
import { audit } from '../../core/audit/index.js';
import { parseListQuery } from '../../core/query/index.js';
import { NotFoundError, ConflictError } from '../../core/errors/index.js';

export function normalizeRedirectPath(path) {
  if (!path) return '';
  let normalized = path.trim().toLowerCase();
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

export const redirectService = {
  async createAutoRedirect(fromPath, toPath) {
    const from = normalizeRedirectPath(fromPath);
    const to = normalizeRedirectPath(toPath);

    if (!from || !to || from === to) return null;

    try {
      // 1. Flatten chains: any redirect that previously pointed to `from` should now point to `to`
      await RedirectModel.updateMany({ to: from }, { $set: { to } });

      // 2. Break potential loop: remove any redirect that points from `to` to `from`
      await RedirectModel.deleteOne({ from: to, to: from });

      // 3. Upsert the auto-redirect
      const redirect = await RedirectModel.findOneAndUpdate(
        { from },
        {
          $set: {
            from,
            to,
            statusCode: 301,
            isActive: true,
            source: 'auto',
          },
        },
        { upsert: true, new: true },
      );

      cache.invalidateTag('redirects');
      return redirect;
    } catch (error) {
      logger.warn(`Failed to create auto-redirect from '${from}' to '${to}': ${error.message}`);
      return null;
    }
  },

  async resolve(path) {
    const normalized = normalizeRedirectPath(path);
    if (!normalized) return null;

    const cacheKey = `redirect:${normalized}`;
    const cached = cache.get(cacheKey);
    if (cached !== null) return cached;

    const record = await RedirectModel.findOne({ from: normalized, isActive: true }).lean();
    if (!record) {
      cache.set(cacheKey, false, { tags: ['redirects'], ttlMs: 60000 });
      return null;
    }

    const result = { to: record.to, statusCode: record.statusCode };
    cache.set(cacheKey, result, { tags: ['redirects'], ttlMs: 60000 });
    return result;
  },

  // Admin Methods
  async listRedirects(rawQuery = {}) {
    const parsed = parseListQuery(rawQuery, {
      allowedSortFields: ['createdAt', 'from', 'to'],
      defaultSort: 'createdAt',
    });

    const filter = {};
    if (rawQuery.source) {
      filter.source = rawQuery.source;
    }
    if (rawQuery.isActive !== undefined) {
      filter.isActive = rawQuery.isActive === 'true' || rawQuery.isActive === true;
    }

    if (rawQuery.search) {
      const term = rawQuery.search.trim().toLowerCase();
      filter.$or = [
        { from: { $regex: term, $options: 'i' } },
        { to: { $regex: term, $options: 'i' } },
      ];
    }

    const total = await RedirectModel.countDocuments(filter);
    const docs = await RedirectModel.find(filter)
      .sort(parsed.sort)
      .skip(parsed.skip)
      .limit(parsed.limit)
      .lean();

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

  async getRedirectById(id) {
    const record = await RedirectModel.findById(id).lean();
    if (!record) {
      throw new NotFoundError('Redirect not found');
    }
    return record;
  },

  async createRedirect(data, _callerId) {
    const from = normalizeRedirectPath(data.from || data.sourcePath);
    const to = normalizeRedirectPath(data.to || data.targetPath);

    if (!from || !to) {
      throw new ConflictError('Both from and to paths are required');
    }
    if (from === to) {
      throw new ConflictError('Cannot redirect a path to itself');
    }

    // Check potential loop
    const reverse = await RedirectModel.findOne({ from: to, to: from });
    if (reverse) {
      throw new ConflictError('Redirect loop detected with existing redirect');
    }

    // Check existing
    const existing = await RedirectModel.findOne({ from });
    if (existing) {
      throw new ConflictError(`Redirect from '${from}' already exists`);
    }

    // Flatten chains: update existing redirects that point to `from` to now point to `to`
    await RedirectModel.updateMany({ to: from }, { $set: { to } });

    const redirect = await RedirectModel.create({
      from,
      to,
      statusCode: data.statusCode || 301,
      isActive: data.isActive !== false,
      source: data.source || 'manual',
    });

    cache.invalidateTag('redirects');

    await audit.record({
      action: 'redirect.create',
      resource: { type: 'redirect', id: redirect._id.toString(), label: from },
      changes: { from, to, statusCode: redirect.statusCode },
    });

    return redirect;
  },

  async updateRedirect(id, data, _callerId) {
    const redirect = await RedirectModel.findById(id);
    if (!redirect) {
      throw new NotFoundError('Redirect not found');
    }

    const updates = {};
    if (data.from || data.sourcePath) {
      updates.from = normalizeRedirectPath(data.from || data.sourcePath);
    }
    if (data.to || data.targetPath) {
      updates.to = normalizeRedirectPath(data.to || data.targetPath);
    }
    if (data.statusCode) updates.statusCode = data.statusCode;
    if (data.isActive !== undefined) updates.isActive = data.isActive;

    const from = updates.from || redirect.from;
    const to = updates.to || redirect.to;

    if (from === to) {
      throw new ConflictError('Cannot redirect a path to itself');
    }

    // Check conflict if from changed
    if (updates.from && updates.from !== redirect.from) {
      const existing = await RedirectModel.findOne({ from: updates.from, _id: { $ne: id } });
      if (existing) {
        throw new ConflictError(`Redirect from '${updates.from}' already exists`);
      }
    }

    Object.assign(redirect, updates);
    await redirect.save();

    cache.invalidateTag('redirects');

    await audit.record({
      action: 'redirect.update',
      resource: { type: 'redirect', id: redirect._id.toString(), label: redirect.from },
      changes: updates,
    });

    return redirect;
  },

  async deleteRedirect(id, _callerId) {
    const redirect = await RedirectModel.findById(id);
    if (!redirect) {
      throw new NotFoundError('Redirect not found');
    }

    await RedirectModel.findByIdAndDelete(id);
    cache.invalidateTag('redirects');

    await audit.record({
      action: 'redirect.delete',
      resource: { type: 'redirect', id: redirect._id.toString(), label: redirect.from },
    });
  },
};
