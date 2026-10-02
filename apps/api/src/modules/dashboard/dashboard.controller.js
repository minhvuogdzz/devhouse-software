import { dashboardService } from './dashboard.service.js';
import { sendSuccess } from '../../core/http/index.js';

export const dashboardController = {
  async getSummary(_req, res) {
    const summary = await dashboardService.getSummary();
    return sendSuccess(res, summary);
  },
};
