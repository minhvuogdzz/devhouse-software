import { config } from '../../config/index.js';
import { sendSuccess } from '../../core/http/index.js';
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from '../../core/errors/index.js';
import { ERROR_CODES } from '@devhouse/shared';
import { UserModel } from '../users/user.model.js';
import { AuthTokenModel } from './auth-token.model.js';
import { sessionService, hashToken } from './session.service.js';
import { audit } from '../../core/audit/index.js';
import { mailer } from '../../integrations/mail/index.js';
import { randomBytes } from 'node:crypto';

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
}

export const authController = {
  async login(req, res) {
    const { email, password } = req.valid.body;
    const lowerEmail = email.toLowerCase().trim();

    const user = await UserModel.findOne({ email: lowerEmail }).select('+passwordHash');

    if (!user) {
      await audit.record({
        action: 'auth.login.failure',
        resource: { type: 'user', label: lowerEmail },
        outcome: 'failure',
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check account lockout
    if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
      throw new AppError(
        ERROR_CODES.ACCOUNT_LOCKED,
        'Account is temporarily locked due to multiple failed attempts. Please try again later.',
      );
    }

    if (user.status === 'disabled') {
      throw new ForbiddenError('Account has been deactivated');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      user.failedLoginCount = (user.failedLoginCount || 0) + 1;
      if (user.failedLoginCount >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        await user.save();

        await audit.record({
          action: 'auth.login.lockout',
          resource: { type: 'user', id: user._id.toString(), label: user.email },
          outcome: 'failure',
        });

        throw new AppError(
          ERROR_CODES.ACCOUNT_LOCKED,
          'Account is temporarily locked due to multiple failed attempts. Please try again later.',
        );
      }
      await user.save();

      await audit.record({
        action: 'auth.login.failure',
        resource: { type: 'user', id: user._id.toString(), label: user.email },
        outcome: 'failure',
      });

      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset login failures on success
    user.failedLoginCount = 0;
    user.lockUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const { token, permissions } = await sessionService.createSession(user, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.cookie(config.SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: config.SESSION_ABSOLUTE_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    await audit.record({
      action: 'auth.login.success',
      resource: { type: 'user', id: user._id.toString(), label: user.email },
      outcome: 'success',
    });

    return sendSuccess(res, {
      user: sanitizeUser(user),
      permissions,
    });
  },

  async logout(req, res) {
    const token = req.token || req.cookies?.[config.SESSION_COOKIE_NAME];
    if (token) {
      await sessionService.revokeSession(token);
    }

    res.clearCookie(config.SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: config.NODE_ENV === 'production',
    });

    if (req.auth?.user) {
      await audit.record({
        action: 'auth.logout',
        resource: { type: 'user', id: req.auth.user._id?.toString(), label: req.auth.user.email },
      });
    }

    return sendSuccess(res, { loggedOut: true });
  },

  async me(req, res) {
    return sendSuccess(res, {
      user: sanitizeUser(req.auth.user),
      permissions: req.auth.permissions,
    });
  },

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.valid.body;
    const user = await UserModel.findById(req.auth.user._id).select('+passwordHash');

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new BadRequestError('Current password does not match');
    }

    user.passwordHash = await UserModel.hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    user.mustChangePassword = false;
    await user.save();

    // Revoke all existing sessions
    await sessionService.revokeAllUserSessions(user._id);

    // Create a fresh session for this device
    const { token, permissions } = await sessionService.createSession(user, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.cookie(config.SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: config.SESSION_ABSOLUTE_TTL_DAYS * 24 * 60 * 60 * 1000,
    });

    await audit.record({
      action: 'auth.password.changed',
      resource: { type: 'user', id: user._id.toString(), label: user.email },
    });

    return sendSuccess(res, {
      changed: true,
      user: sanitizeUser(user),
      permissions,
    });
  },

  async forgotPassword(req, res) {
    const { email } = req.valid.body;
    const lowerEmail = email.toLowerCase().trim();

    const user = await UserModel.findOne({ email: lowerEmail, status: 'active', isDeleted: false });

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await AuthTokenModel.create({
        user: user._id,
        type: 'password_reset',
        tokenHash,
        expiresAt,
      });

      const resetUrl = `${config.ADMIN_URL}/reset-password?token=${rawToken}`;
      await mailer.sendMail({
        to: user.email,
        subject: 'Khôi phục mật khẩu tài khoản Dev House Software',
        text: `Chào bạn, bạn vừa yêu cầu khôi phục mật khẩu. Nhấp vào liên kết sau để thiết lập lại mật khẩu: ${resetUrl}`,
        html: `<p>Chào bạn,</p><p>Bạn vừa yêu cầu khôi phục mật khẩu quản trị. Nhấp vào đường dẫn sau (có hiệu lực trong 30 phút):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
    }

    // Always return 202 Accepted to prevent user enumeration (§16.4)
    return res.status(202).json({
      success: true,
      message: 'If an account exists, a password reset link has been dispatched.',
    });
  },

  async resetPassword(req, res) {
    const { token, newPassword } = req.valid.body;
    const tokenHash = hashToken(token);

    const authToken = await AuthTokenModel.findOne({
      tokenHash,
      type: 'password_reset',
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!authToken) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const user = await UserModel.findById(authToken.user);
    if (!user || user.status === 'disabled') {
      throw new BadRequestError('User account not found or disabled');
    }

    user.passwordHash = await UserModel.hashPassword(newPassword);
    user.passwordChangedAt = new Date();
    await user.save();

    authToken.usedAt = new Date();
    await authToken.save();

    await sessionService.revokeAllUserSessions(user._id);

    await audit.record({
      action: 'auth.password.reset',
      resource: { type: 'user', id: user._id.toString(), label: user.email },
    });

    return sendSuccess(res, { reset: true });
  },
};
