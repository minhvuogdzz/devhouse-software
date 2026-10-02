import { RoleModel } from './role.model.js';
import { UserModel } from '../users/user.model.js';
import { sendSuccess } from '../../core/http/index.js';
import { BadRequestError, NotFoundError, ConflictError } from '../../core/errors/index.js';
import { audit } from '../../core/audit/index.js';
import { PERMISSIONS } from '@devhouse/shared';

export const roleController = {
  async list(_req, res) {
    const roles = await RoleModel.find().sort({ isSystem: -1, createdAt: 1 }).lean();
    return sendSuccess(res, roles);
  },

  async getById(req, res) {
    const role = await RoleModel.findById(req.params.id).lean();
    if (!role) {
      throw new NotFoundError('Role not found');
    }
    return sendSuccess(res, role);
  },

  async create(req, res) {
    const { key, name, description, permissions } = req.valid.body;

    const existing = await RoleModel.findOne({ key });
    if (existing) {
      throw new ConflictError(`Role with key '${key}' already exists`);
    }

    const role = await RoleModel.create({
      key,
      name,
      description,
      permissions,
      isSystem: false,
    });

    await audit.record({
      action: 'role.manage',
      resource: { type: 'role', id: role._id.toString(), label: role.key },
      changes: { permissions: role.permissions },
    });

    return sendSuccess(res, role, 201);
  },

  async update(req, res) {
    const { id } = req.params;
    const { name, description, permissions } = req.valid.body;

    const role = await RoleModel.findById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestError('System roles cannot be modified');
    }

    if (name) role.name = name;
    if (description) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();

    await audit.record({
      action: 'role.manage',
      resource: { type: 'role', id: role._id.toString(), label: role.key },
      changes: { permissions: role.permissions },
    });

    return sendSuccess(res, role);
  },

  async delete(req, res) {
    const { id } = req.params;

    const role = await RoleModel.findById(id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestError('System roles cannot be deleted');
    }

    // Guard: Role in use cannot be deleted (§17.5)
    const inUse = await UserModel.exists({ roleKeys: role.key, isDeleted: false });
    if (inUse) {
      throw new BadRequestError(
        `Cannot delete role '${role.key}' because it is assigned to one or more active users`,
      );
    }

    await RoleModel.deleteOne({ _id: id });

    await audit.record({
      action: 'role.manage',
      resource: { type: 'role', id, label: role.key },
      changes: { deleted: true },
    });

    return sendSuccess(res, { deleted: true });
  },

  async listPermissions(_req, res) {
    return sendSuccess(res, PERMISSIONS);
  },
};
