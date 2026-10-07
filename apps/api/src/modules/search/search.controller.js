import { searchService } from './search.service.js';
import { sendSuccess } from '../../core/http/index.js';

export const searchController = {
  async universalSearch(req, res) {
    const q = req.query.q || '';
    const locale = req.query.locale || 'vi';
    const limit = parseInt(req.query.limit, 10) || 25;

    const result = await searchService.universalSearch({ q, locale, limit });
    return sendSuccess(res, result);
  },

  async aiSearch(req, res) {
    const q = req.body?.q || req.body?.query || req.query.q || '';
    const locale = req.body?.locale || req.query.locale || 'vi';

    const result = await searchService.aiSearch({ q, locale });
    return sendSuccess(res, result);
  },
};
