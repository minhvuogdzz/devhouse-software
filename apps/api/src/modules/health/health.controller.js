import { mongoose, isDbConnected } from '../../core/db/connection.js';

export const healthController = {
  live(_req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ status: 'live' });
  },

  async ready(_req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (!isDbConnected()) {
      return res.status(503).json({ status: 'not_ready', database: 'disconnected' });
    }

    try {
      // Ping DB with 2s timeout
      await Promise.race([
        mongoose.connection.db.admin().ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('DB ping timeout')), 2000)),
      ]);

      return res.status(200).json({ status: 'ready', database: 'connected' });
    } catch {
      return res.status(503).json({ status: 'not_ready', database: 'unreachable' });
    }
  },

  async check(_req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (!isDbConnected()) {
      return res.status(503).json({ status: 'degraded' });
    }

    try {
      await Promise.race([
        mongoose.connection.db.admin().ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]);
      return res.status(200).json({ status: 'ok' });
    } catch {
      return res.status(503).json({ status: 'degraded' });
    }
  },
};
