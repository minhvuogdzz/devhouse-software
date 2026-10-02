import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import { requestIdMiddleware } from './core/middleware/request-id.js';
import { errorHandler, NotFoundError } from './core/errors/index.js';
import { apiRouter } from './routes.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', config.TRUST_PROXY);

  // Global middleware
  app.use(requestIdMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // Mount API v1 router
  app.use('/api/v1', apiRouter);

  // 404 Handler
  app.use((req, _res, next) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`, 'ROUTE_NOT_FOUND'));
  });

  // Error middleware
  app.use(errorHandler);

  return app;
};

export const app = createApp();
