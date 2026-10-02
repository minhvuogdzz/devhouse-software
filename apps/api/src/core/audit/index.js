import { getContext } from '../context/index.js';
import { logger } from '../logger/index.js';
import { AuditLogModel } from '../../modules/audit-logs/audit-log.model.js';

export const audit = {
  async record(entry = {}) {
    try {
      const context = getContext();
      const actor = context.actor || null;

      const auditData = {
        actor: {
          id: actor?.id || actor?._id || 'system',
          email: actor?.email || 'system@devhouse.internal',
          roleKeys: actor?.roleKeys || [],
        },
        action: entry.action,
        resource: entry.resource,
        changes: entry.changes || null,
        outcome: entry.outcome || 'success',
        requestId: context.requestId || 'no-request-id',
        ip: context.ip || null,
        userAgent: context.userAgent || null,
      };

      await AuditLogModel.create(auditData);
    } catch (err) {
      // An audit write failure is logged as an error but does not fail user operation in MVP (§27.4)
      logger.error(`Failed to record audit log: ${err.message}`, { action: entry.action });
    }
  },
};
