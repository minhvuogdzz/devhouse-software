import nodemailer from 'nodemailer';
import { config } from '../../config/index.js';
import { logger } from '../../core/logger/index.js';

let transporterInstance = null;

function resolveSmtpOptions() {
  const host =
    config.SMTP_HOST || (config.SMTP_USER?.includes('@gmail.com') ? 'smtp.gmail.com' : '');
  const port = Number(config.SMTP_PORT) || 587;
  const secure =
    config.SMTP_SECURE !== undefined ? Boolean(config.SMTP_SECURE) : port === 465;

  return {
    host,
    port,
    secure,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASSWORD,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  };
}

function getTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }
  const options = resolveSmtpOptions();
  transporterInstance = nodemailer.createTransport(options);
  return transporterInstance;
}

export const mailer = {
  isConfigured() {
    const host =
      config.SMTP_HOST || (config.SMTP_USER?.includes('@gmail.com') ? 'smtp.gmail.com' : '');
    return Boolean(host && config.SMTP_USER && config.SMTP_PASSWORD);
  },

  async verifyConnection() {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'SMTP credentials (SMTP_USER / SMTP_PASSWORD) are not configured.',
      };
    }

    try {
      const transporter = getTransporter();
      await transporter.verify();
      return { configured: true, verified: true };
    } catch (err) {
      logger.error(`SMTP verification failed: ${err.message}`);
      return { configured: true, verified: false, error: err.message };
    }
  },

  async sendMail({ to, subject, html, text, from, replyTo }) {
    const sender =
      from ||
      config.MAIL_FROM ||
      (config.SMTP_USER
        ? `Dev House Software <${config.SMTP_USER}>`
        : 'Dev House Software <devhousesoftware.inc@gmail.com>');

    if (!this.isConfigured()) {
      logger.info(`[MAIL NOT CONFIGURED] Would send email:`, {
        to,
        from: sender,
        subject,
        previewText: (text || html || '').substring(0, 150),
      });
      return { messageId: 'simulated-mail-id', delivered: false, simulated: true };
    }

    try {
      const transporter = getTransporter();
      const info = await transporter.sendMail({
        from: sender,
        to,
        replyTo: replyTo || undefined,
        subject,
        text,
        html,
      });

      logger.info(`Email successfully dispatched: ${info.messageId} to ${to} (${subject})`);
      return {
        messageId: info.messageId,
        delivered: true,
        response: info.response,
      };
    } catch (err) {
      logger.error(`Failed to send email to ${to}: ${err.message}`);
      throw err;
    }
  },

  resetTransporter() {
    if (transporterInstance?.close) {
      try {
        transporterInstance.close();
      } catch {
        // Ignored
      }
    }
    transporterInstance = null;
  },
};

export { buildContactNotificationEmail, buildCustomerConfirmationEmail } from './templates.js';
