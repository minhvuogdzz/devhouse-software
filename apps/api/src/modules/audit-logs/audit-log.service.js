import { AuditLogModel } from './audit-log.model.js';
import { parseListQuery } from '../../core/query/index.js';
import { NotFoundError } from '../../core/errors/index.js';

export const auditLogService = {
  async listAuditLogs(rawQuery = {}) {
    const parsed = parseListQuery(rawQuery, {
      allowedSortFields: ['createdAt', 'action'],
      defaultSort: 'createdAt',
    });

    const filter = {};

    if (rawQuery.actor) {
      filter.$or = [
        { 'actor.id': rawQuery.actor },
        { 'actor.email': { $regex: rawQuery.actor, $options: 'i' } },
      ];
    }

    if (rawQuery.action) {
      filter.action = { $regex: rawQuery.action, $options: 'i' };
    }

    if (rawQuery.resourceType) {
      filter['resource.type'] = rawQuery.resourceType;
    }

    if (rawQuery.resourceId) {
      filter['resource.id'] = rawQuery.resourceId;
    }

    if (rawQuery.from || rawQuery.to) {
      filter.createdAt = {};
      if (rawQuery.from) filter.createdAt.$gte = new Date(rawQuery.from);
      if (rawQuery.to) filter.createdAt.$lte = new Date(rawQuery.to);
    }

    const total = await AuditLogModel.countDocuments(filter);
    const docs = await AuditLogModel.find(filter)
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

  async getAuditLogById(id) {
    const doc = await AuditLogModel.findById(id).lean();
    if (!doc) {
      throw new NotFoundError('Audit log entry not found');
    }
    return doc;
  },
};
