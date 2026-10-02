import { contentService } from './content.service.js';
import { sendSuccess } from '../../core/http/index.js';
import { sanitizePublicDTO } from '../../core/utils/dto.js';

export const siteController = {
  async getSite(req, res) {
    const locale = req.query.locale || 'vi';
    const site = await contentService.getSite(locale);
    return sendSuccess(res, sanitizePublicDTO(site, locale));
  },

  async getPage(req, res) {
    const { key } = req.params;
    const locale = req.query.locale || 'vi';
    const page = await contentService.getPage(key, locale);
    return sendSuccess(res, sanitizePublicDTO(page, locale));
  },
};
