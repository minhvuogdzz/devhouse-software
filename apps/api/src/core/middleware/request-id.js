import { randomUUID } from 'node:crypto';
import { runWithContext } from '../context/index.js';

export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.get('x-request-id') || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const context = {
    requestId,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.get('user-agent'),
    actor: null,
  };

  runWithContext(context, () => {
    next();
  });
};
