import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../core/middleware/validate.js';
import { authenticate } from '../../core/middleware/authenticate.js';
import {
  LoginSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@devhouse/shared';

export const authRoutes = Router();

authRoutes.post('/login', validate({ body: LoginSchema }), authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.get('/me', authenticate, authController.me);
authRoutes.post(
  '/password/change',
  authenticate,
  validate({ body: ChangePasswordSchema }),
  authController.changePassword,
);
authRoutes.post(
  '/password/forgot',
  validate({ body: ForgotPasswordSchema }),
  authController.forgotPassword,
);
authRoutes.post(
  '/password/reset',
  validate({ body: ResetPasswordSchema }),
  authController.resetPassword,
);
