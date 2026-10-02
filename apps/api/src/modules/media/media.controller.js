import { mediaService } from './media.service.js';
import { sendSuccess, sendPaginated } from '../../core/http/index.js';

export const mediaController = {
  getUploadSignature(req, res) {
    const signature = mediaService.getUploadSignature(req.body || {});
    return sendSuccess(res, signature);
  },

  async registerMedia(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const media = await mediaService.registerMedia(req.body, callerId);
    return sendSuccess(res, media, 201);
  },

  async listMedia(req, res) {
    const result = await mediaService.listMedia(req.query);
    return sendPaginated(res, result.data, result.pagination);
  },

  async getMediaById(req, res) {
    const media = await mediaService.getMediaById(req.params.id);
    return sendSuccess(res, media);
  },

  async updateMedia(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const media = await mediaService.updateMedia(req.params.id, req.body, callerId);
    return sendSuccess(res, media);
  },

  async getMediaUsage(req, res) {
    const usages = await mediaService.getMediaUsage(req.params.id);
    return sendSuccess(res, usages);
  },

  async deleteMedia(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const force = req.query.force === 'true';
    await mediaService.deleteMedia(req.params.id, { force }, callerId);
    return res.status(204).end();
  },
};
