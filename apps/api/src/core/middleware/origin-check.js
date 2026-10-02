import { config } from '../../config/index.js';
import { ForbiddenError } from '../errors/index.js';
import { ERROR_CODES } from '@devhouse/shared';

const STATE_CHANGING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const originCheck = (req, _res, next) => {
  if (!STATE_CHANGING_METHODS.includes(req.method)) {
    return next();
  }

  const origin = req.get('origin');
  if (!origin) {
    // In local dev/curl/tests without origin header, allow
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      return next();
    }
    return next(
      new ForbiddenError(
        'Origin header required for state-changing requests',
        ERROR_CODES.INVALID_ORIGIN,
      ),
    );
  }

  const allowedOrigins = [config.WEB_URL, config.ADMIN_URL];
  // Strip trailing slashes for comparison
  const normalizedOrigin = origin.replace(/\/$/, '');
  const isAllowed = allowedOrigins.some(allowed => allowed.replace(/\/$/, '') === normalizedOrigin);

  if (!isAllowed) {
    return next(new ForbiddenError(`Origin ${origin} is not allowed`, ERROR_CODES.INVALID_ORIGIN));
  }

  next();
};
