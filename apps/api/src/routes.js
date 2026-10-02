import { Router } from 'express';
import { healthRoutes } from './modules/health/health.routes.js';

export const apiRouter = Router();

// Health checks
apiRouter.use('/health', healthRoutes);
