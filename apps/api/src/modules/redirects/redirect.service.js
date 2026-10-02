import { RedirectModel } from './redirect.model.js';
import { cache } from '../../core/cache/index.js';
import { logger } from '../../core/logger/index.js';

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
};
