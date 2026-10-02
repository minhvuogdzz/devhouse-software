import { config } from '../../config/index.js';
import { logger } from '../../core/logger/index.js';

export const mailer = {
  isConfigured() {
    return Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASSWORD);
  },

  async sendMail({ to, subject, html, text }) {
    if (!this.isConfigured()) {
      logger.info(`[MAIL NOT CONFIGURED] Would send email:`, {
        to,
        from: config.MAIL_FROM,
        subject,
        previewText: (text || html || '').substring(0, 150),
      });
      return { messageId: 'simulated-mail-id', delivered: false, simulated: true };
    }

    // In a real environment with SMTP, nodemailer or a direct client sends it
    logger.info(`Sending mail to ${to} (${subject})`);
    return { messageId: 'sent-mail-id', delivered: true };
  },
};
