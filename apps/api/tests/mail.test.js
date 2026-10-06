import { describe, it, expect, afterEach } from 'vitest';
import {
  mailer,
  buildContactNotificationEmail,
  buildCustomerConfirmationEmail,
} from '../src/integrations/mail/index.js';
import { config } from '../src/config/index.js';

describe('Mail Integration & Templates', () => {
  const originalUser = config.SMTP_USER;
  const originalPass = config.SMTP_PASSWORD;
  const originalHost = config.SMTP_HOST;

  afterEach(() => {
    config.SMTP_USER = originalUser;
    config.SMTP_PASSWORD = originalPass;
    config.SMTP_HOST = originalHost;
    mailer.resetTransporter();
  });

  describe('isConfigured()', () => {
    it('returns false when credentials are empty', () => {
      config.SMTP_USER = '';
      config.SMTP_PASSWORD = '';
      expect(mailer.isConfigured()).toBe(false);
    });

    it('returns true when Gmail user and password are provided', () => {
      config.SMTP_USER = 'devhousesoftware.inc@gmail.com';
      config.SMTP_PASSWORD = 'abcd efgh ijkl mnop';
      expect(mailer.isConfigured()).toBe(true);
    });
  });

  describe('verifyConnection()', () => {
    it('returns unconfigured status when credentials are not set', async () => {
      config.SMTP_USER = '';
      config.SMTP_PASSWORD = '';
      const result = await mailer.verifyConnection();
      expect(result.configured).toBe(false);
    });
  });

  describe('sendMail() fallback simulation', () => {
    it('simulates dispatch safely without throwing when unconfigured', async () => {
      config.SMTP_USER = '';
      config.SMTP_PASSWORD = '';
      const result = await mailer.sendMail({
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test Body',
      });
      expect(result.simulated).toBe(true);
      expect(result.delivered).toBe(false);
    });
  });

  describe('Templates', () => {
    const mockContactDoc = {
      name: 'Nguyễn Văn Test',
      email: 'test@client.com',
      phone: '0987654321',
      company: 'Tech Corp',
      budget: '50-100tr',
      timeline: '1-2 tháng',
      preferredContactMethod: 'email',
      message: 'Tôi muốn tư vấn giải pháp web app',
      meta: {
        ip: '1.2.3.4',
        locale: 'vi',
      },
    };

    it('builds contact notification email with full data', () => {
      const email = buildContactNotificationEmail({
        contactDoc: mockContactDoc,
        serviceName: 'Thiết kế website',
      });
      expect(email.subject).toContain('Dev House Contact');
      expect(email.text).toContain('Nguyễn Văn Test');
      expect(email.text).toContain('test@client.com');
      expect(email.html).toContain('Thiết kế website');
      expect(email.html).toContain('mailto:test@client.com');
    });

    it('builds customer auto-reply confirmation email in Vietnamese and English', () => {
      const viEmail = buildCustomerConfirmationEmail({
        contactDoc: mockContactDoc,
        serviceName: 'Thiết kế website',
      });
      expect(viEmail.subject).toContain('nhận được');
      expect(viEmail.html).toContain('Kính gửi');

      const enDoc = { ...mockContactDoc, meta: { locale: 'en' } };
      const enEmail = buildCustomerConfirmationEmail({
        contactDoc: enDoc,
        serviceName: 'Web Development',
      });
      expect(enEmail.subject).toContain('received');
      expect(enEmail.html).toContain('Dear');
    });
  });
});
