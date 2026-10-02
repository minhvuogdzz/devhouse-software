import { randomBytes, createHash } from 'node:crypto';
import { config } from '../../config/index.js';
import { cache } from '../../core/cache/index.js';
import { SessionModel } from './session.model.js';
import { UserModel } from '../users/user.model.js';
import { RoleModel } from '../roles/role.model.js';

export const hashToken = token => {
  return createHash('sha256').update(token).digest('hex');
};

export const sessionService = {
  async createSession(user, reqDetails = {}) {
    // Generate 256-bit secure random token
    const token = randomBytes(32).toString('base64url');
    const tokenHash = hashToken(token);

    const now = Date.now();
    const idleTtlMs = config.SESSION_IDLE_TTL_MINUTES * 60 * 1000;
    const absoluteTtlMs = config.SESSION_ABSOLUTE_TTL_DAYS * 24 * 60 * 60 * 1000;

    const expiresAt = new Date(now + idleTtlMs);
    const absoluteExpiresAt = new Date(now + absoluteTtlMs);

    const session = await SessionModel.create({
      tokenHash,
      user: user._id || user.id,
      expiresAt,
      absoluteExpiresAt,
      lastUsedAt: new Date(now),
      ip: reqDetails.ip || null,
      userAgent: reqDetails.userAgent || null,
    });

    // Populate user permissions
    const permissions = await this.resolveUserPermissions(user.roleKeys);

    // Cache session in process for 30s
    cache.set(
      `session:${tokenHash}`,
      {
        session: session.toObject ? session.toObject() : session,
        user: user.toObject ? user.toObject() : user,
        permissions,
      },
      { ttlMs: 30000, tags: [`user:${user._id || user.id}`] },
    );

    return { token, session, permissions };
  },

  async resolveUserPermissions(roleKeys = []) {
    if (!roleKeys || roleKeys.length === 0) return [];
    if (roleKeys.includes('super_admin')) return ['*'];

    const roles = await RoleModel.find({ key: { $in: roleKeys } }).lean();
    const perms = new Set();

    for (const role of roles) {
      if (role.permissions.includes('*')) {
        return ['*'];
      }
      for (const p of role.permissions) {
        perms.add(p);
      }
    }

    return Array.from(perms);
  },

  async validateSession(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') return null;

    const tokenHash = hashToken(rawToken);
    const cacheKey = `session:${tokenHash}`;

    // 1. Check in-process cache
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Lookup session in DB
    const session = await SessionModel.findOne({ tokenHash }).lean();
    if (!session) return null;

    const now = new Date();
    if (now > new Date(session.expiresAt) || now > new Date(session.absoluteExpiresAt)) {
      await SessionModel.deleteOne({ _id: session._id });
      return null;
    }

    // 3. Lookup user
    const user = await UserModel.findById(session.user).lean();
    if (!user || user.status === 'disabled' || user.isDeleted) {
      await SessionModel.deleteOne({ _id: session._id });
      return null;
    }

    // 4. Extend sliding idle TTL if lastUsedAt was > 5 minutes ago
    const lastUsed = new Date(session.lastUsedAt || 0).getTime();
    if (Date.now() - lastUsed > 5 * 60 * 1000) {
      const newExpiresAt = new Date(Date.now() + config.SESSION_IDLE_TTL_MINUTES * 60 * 1000);
      // Bound by absoluteExpiresAt
      const finalExpiresAt =
        newExpiresAt > new Date(session.absoluteExpiresAt)
          ? new Date(session.absoluteExpiresAt)
          : newExpiresAt;

      await SessionModel.updateOne(
        { _id: session._id },
        { $set: { lastUsedAt: new Date(), expiresAt: finalExpiresAt } },
      );
    }

    const permissions = await this.resolveUserPermissions(user.roleKeys);

    const payload = {
      session,
      user,
      permissions,
    };

    // Cache session in memory for 30s
    cache.set(cacheKey, payload, { ttlMs: 30000, tags: [`user:${user._id}`] });

    return payload;
  },

  async revokeSession(rawToken) {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    cache.invalidateKey(`session:${tokenHash}`);
    await SessionModel.deleteOne({ tokenHash });
  },

  async revokeAllUserSessions(userId) {
    const id = userId.toString();
    cache.invalidateTag(`user:${id}`);
    await SessionModel.deleteMany({ user: id });
  },
};
