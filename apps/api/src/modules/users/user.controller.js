import { UserModel } from './user.model.js';
import { RoleModel } from '../roles/role.model.js';
import { createRepository } from '../../core/db/base-repository.js';
import { sendSuccess, sendPaginated } from '../../core/http/index.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../core/errors/index.js';
import { sessionService } from '../auth/session.service.js';
import { audit } from '../../core/audit/index.js';
import { hasPermission } from '@devhouse/shared';

const userRepo = createRepository(UserModel, {
  searchFields: ['name', 'email'],
  allowedSortFields: ['createdAt', 'name', 'email', 'status'],
});

function sanitize(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
}

async function validateRoleEscalation(callerPermissions, targetRoleKeys) {
  if (callerPermissions.includes('*')) return; // Super admin can assign any role

  const roles = await RoleModel.find({ key: { $in: targetRoleKeys } }).lean();
  for (const role of roles) {
    if (role.permissions.includes('*')) {
      throw new ForbiddenError('Cannot assign role with higher permissions than your own');
    }
    for (const perm of role.permissions) {
      if (!hasPermission(callerPermissions, perm)) {
        throw new ForbiddenError(
          `Cannot assign role containing permission '${perm}' which you do not hold`,
        );
      }
    }
  }
}

export const userController = {
  async list(req, res) {
    const result = await userRepo.findPaginated(req.query, {}, { select: '-passwordHash' });
    return sendPaginated(res, result.data, result.pagination);
  },

  async getById(req, res) {
    const user = await userRepo.findById(req.params.id, { select: '-passwordHash' });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return sendSuccess(res, sanitize(user));
  },

  async create(req, res) {
    const { email, name, roleKeys, status, password } = req.valid.body;
    const lowerEmail = email.toLowerCase().trim();

    const existing = await UserModel.findOne({ email: lowerEmail });
    if (existing) {
      throw new ConflictError('A user with this email address already exists');
    }

    await validateRoleEscalation(req.auth.permissions, roleKeys);

    const defaultPwd = password || 'DevHouse2026!';
    const passwordHash = await UserModel.hashPassword(defaultPwd);

    const user = await UserModel.create({
      email: lowerEmail,
      name,
      roleKeys,
      status: status || 'active',
      passwordHash,
      mustChangePassword: !password,
    });

    await audit.record({
      action: 'user.create',
      resource: { type: 'user', id: user._id.toString(), label: user.email },
      changes: { email: user.email, name: user.name, roleKeys: user.roleKeys },
    });

    return sendSuccess(res, sanitize(user), 201);
  },

  async update(req, res) {
    const { id } = req.params;
    const { name, roleKeys, status, password } = req.valid.body;
    const callerId = req.auth.user._id ? req.auth.user._id.toString() : req.auth.user.id;

    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Escalation guard 1: A user cannot change their own roles or disable themselves (§17.5)
    if (id === callerId) {
      if (roleKeys && JSON.stringify(roleKeys.sort()) !== JSON.stringify(user.roleKeys.sort())) {
        throw new ForbiddenError('You cannot modify your own roles');
      }
      if (status && status !== user.status) {
        throw new ForbiddenError('You cannot deactivate your own account');
      }
    }

    // Escalation guard 2: Last super admin cannot be demoted or disabled (§17.5)
    if (user.roleKeys.includes('super_admin')) {
      const willLoseSuperAdmin = roleKeys && !roleKeys.includes('super_admin');
      const willBeDisabled = status && status === 'disabled';

      if (willLoseSuperAdmin || willBeDisabled) {
        const superAdminCount = await UserModel.countDocuments({
          roleKeys: 'super_admin',
          status: 'active',
          isDeleted: false,
        });

        if (superAdminCount <= 1) {
          throw new BadRequestError(
            'Cannot demote or deactivate the last active Super Administrator',
          );
        }
      }
    }

    if (roleKeys) {
      await validateRoleEscalation(req.auth.permissions, roleKeys);
      user.roleKeys = roleKeys;
    }

    if (name) user.name = name;
    if (status) user.status = status;
    if (password) {
      user.passwordHash = await UserModel.hashPassword(password);
      user.passwordChangedAt = new Date();
    }

    await user.save();

    // Revoke sessions if role changed or deactivated
    if (roleKeys || status === 'disabled' || password) {
      await sessionService.revokeAllUserSessions(user._id);
    }

    await audit.record({
      action: 'user.update',
      resource: { type: 'user', id: user._id.toString(), label: user.email },
      changes: { roleKeys: user.roleKeys, status: user.status },
    });

    return sendSuccess(res, sanitize(user));
  },

  async delete(req, res) {
    const { id } = req.params;
    const callerId = req.auth.user._id ? req.auth.user._id.toString() : req.auth.user.id;

    if (id === callerId) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    const user = await UserModel.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.roleKeys.includes('super_admin')) {
      const superAdminCount = await UserModel.countDocuments({
        roleKeys: 'super_admin',
        status: 'active',
        isDeleted: false,
      });

      if (superAdminCount <= 1) {
        throw new BadRequestError('Cannot delete the last active Super Administrator');
      }
    }

    await user.softDelete(callerId);
    await sessionService.revokeAllUserSessions(user._id);

    await audit.record({
      action: 'user.delete',
      resource: { type: 'user', id: user._id.toString(), label: user.email },
    });

    return sendSuccess(res, { deleted: true });
  },
};
