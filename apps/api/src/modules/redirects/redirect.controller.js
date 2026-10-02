import { redirectService } from './redirect.service.js';
import { sendSuccess, sendPaginated } from '../../core/http/index.js';

export const redirectController = {
  async adminList(req, res) {
    const result = await redirectService.listRedirects(req.query);
    return sendPaginated(res, result.data, result.pagination);
  },

  async adminGetById(req, res) {
    const record = await redirectService.getRedirectById(req.params.id);
    return sendSuccess(res, record);
  },

  async adminCreate(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const record = await redirectService.createRedirect(req.body, callerId);
    return sendSuccess(res, record, 201);
  },

  async adminUpdate(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const record = await redirectService.updateRedirect(req.params.id, req.body, callerId);
    return sendSuccess(res, record);
  },

  async adminDelete(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    await redirectService.deleteRedirect(req.params.id, callerId);
    return res.status(204).end();
  },
};
