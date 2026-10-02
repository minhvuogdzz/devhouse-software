import { contentService } from '../content/content.service.js';
import { sendSuccess } from '../../core/http/index.js';

export const navigationAdminController = {
  async list(_req, res) {
    const mainNav = await contentService.getAdminNavigation('main');
    return sendSuccess(res, [mainNav]);
  },

  async getByKey(req, res) {
    const key = req.params.key || 'main';
    const nav = await contentService.getAdminNavigation(key);
    return sendSuccess(res, nav);
  },

  async update(req, res) {
    const key = req.params.key || 'main';
    const { header, footer } = req.body;
    const nav = await contentService.updateAdminNavigation(key, { header, footer });
    return sendSuccess(res, nav);
  },
};
