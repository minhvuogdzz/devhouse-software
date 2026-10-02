import { Router } from 'express';
import { healthRoutes } from './modules/health/health.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { userAdminRoutes } from './modules/users/user.admin.routes.js';
import { roleAdminRoutes } from './modules/roles/role.admin.routes.js';
import { authenticate } from './core/middleware/authenticate.js';

export const apiRouter = Router();

// Health checks
apiRouter.use('/health', healthRoutes);

// Auth routes
apiRouter.use('/auth', authRoutes);

// Admin routes (requires authentication on all admin endpoints)
export const adminRouter = Router();
adminRouter.use(authenticate);
adminRouter.use('/users', userAdminRoutes);
adminRouter.use('/roles', roleAdminRoutes);

apiRouter.use('/admin', adminRouter);
