import { contentService } from '../content/content.service.js';
import { sendSuccess } from '../../core/http/index.js';

export const settingsAdminController = {
  async getSettings(_req, res) {
    const settings = await contentService.getAdminSettings();
    return sendSuccess(res, settings);
  },

  async updateSettings(req, res) {
    const data = req.body.data !== undefined ? req.body.data : req.body;
    const settings = await contentService.updateAdminSettings(data);
    return sendSuccess(res, settings);
  },
};
