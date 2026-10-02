import { config } from '../../config/index.js';
import { UnauthorizedError } from '../errors/index.js';
import { getContext } from '../context/index.js';
import { sessionService } from '../../modules/auth/session.service.js';

export const authenticate = async (req, _res, next) => {
  try {
    const cookieToken = req.cookies?.[config.SESSION_COOKIE_NAME];
    const authHeader = req.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const token = cookieToken || headerToken;

    if (!token) {
      return next(new UnauthorizedError('Authentication session required'));
    }

    const auth = await sessionService.validateSession(token);
    if (!auth) {
      return next(new UnauthorizedError('Session invalid or expired'));
    }

    req.auth = auth;
    req.token = token;

    // Attach actor to request context for auditable plugins and audit logs
    const context = getContext();
    if (context) {
      context.actor = {
        id: auth.user._id ? auth.user._id.toString() : auth.user.id,
        email: auth.user.email,
        roleKeys: auth.user.roleKeys,
      };
    }

    next();
  } catch (error) {
    next(error);
  }
};
