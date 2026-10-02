import { ForbiddenError, UnauthorizedError } from '../errors/index.js';
import { hasPermission } from '@devhouse/shared';

export const requirePermission = requiredPermission => {
  const requirePermissionMiddleware = (req, _res, next) => {
    if (!req.auth || !req.auth.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!hasPermission(req.auth.permissions, requiredPermission)) {
      return next(
        new ForbiddenError(`Permission '${requiredPermission}' is required for this action`, [
          { requiredPermission },
        ]),
      );
    }

    next();
  };

  requirePermissionMiddleware._requiredPermission = requiredPermission;
  return requirePermissionMiddleware;
};
