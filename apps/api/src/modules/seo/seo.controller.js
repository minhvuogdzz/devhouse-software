import { seoService } from './seo.service.js';
import { sendSuccess } from '../../core/http/index.js';

export const seoController = {
  async getSitemap(_req, res) {
    const sitemap = await seoService.getSitemapData();
    return sendSuccess(res, sitemap);
  },

  async resolveRedirect(req, res) {
    const target = await seoService.resolveRedirect(req.query.path);
    return sendSuccess(res, target);
  },
};
