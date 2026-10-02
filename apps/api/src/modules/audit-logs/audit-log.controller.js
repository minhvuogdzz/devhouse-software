import { auditLogService } from './audit-log.service.js';
import { sendSuccess, sendPaginated } from '../../core/http/index.js';

export const auditLogController = {
  async adminList(req, res) {
    const result = await auditLogService.listAuditLogs(req.query);
    return sendPaginated(res, result.data, result.pagination);
  },

  async adminGetById(req, res) {
    const log = await auditLogService.getAuditLogById(req.params.id);
    return sendSuccess(res, log);
  },
};
