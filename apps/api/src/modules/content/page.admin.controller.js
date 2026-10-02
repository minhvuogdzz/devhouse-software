import { contentService } from './content.service.js';
import { sendSuccess } from '../../core/http/index.js';

export const pageAdminController = {
  async list(_req, res) {
    const pages = await contentService.listAdminPages();
    return sendSuccess(res, pages);
  },

  async getByKey(req, res) {
    const { key } = req.params;
    const page = await contentService.getAdminPage(key);
    return sendSuccess(res, page);
  },

  async update(req, res) {
    const { key } = req.params;
    const { sections, seo } = req.body;
    const page = await contentService.updateAdminPage(key, { sections, seo });
    return sendSuccess(res, page);
  },

  async resetSection(req, res) {
    const { key, section } = req.params;
    const page = await contentService.resetAdminPageSection(key, section);
    return sendSuccess(res, page);
  },

  async reset(req, res) {
    const { key } = req.params;
    const page = await contentService.resetAdminPage(key);
    return sendSuccess(res, page);
  },
};
