#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * CLI Tool: Test SMTP connection and dispatch a real test email
 * Usage:
 *   node apps/api/scripts/test-email.js [optional_recipient_email]
 */

import { config } from '../src/config/index.js';
import { mailer } from '../src/integrations/mail/index.js';

async function main() {
  console.log('\n======================================================');
  console.log('   Dev House Software — SMTP Email Verification Tool  ');
  console.log('======================================================\n');

  console.log('Current SMTP Configuration:');
  console.log(`  - SMTP_HOST:     ${config.SMTP_HOST || '(auto: smtp.gmail.com)'}`);
  console.log(`  - SMTP_PORT:     ${config.SMTP_PORT}`);
  console.log(`  - SMTP_SECURE:   ${config.SMTP_SECURE !== undefined ? config.SMTP_SECURE : (config.SMTP_PORT === 465 ? 'true (auto SSL)' : 'false')}`);
  console.log(`  - SMTP_USER:     ${config.SMTP_USER || '(NOT CONFIGURED)'}`);
  console.log(`  - SMTP_PASSWORD: ${config.SMTP_PASSWORD ? '•••••••••••••••• (' + config.SMTP_PASSWORD.length + ' chars)' : '(NOT CONFIGURED)'}`);
  console.log(`  - MAIL_FROM:     ${config.MAIL_FROM}`);
  console.log(`  - NOTIFY_TO:     ${config.CONTACT_NOTIFY_TO}\n`);

  if (!mailer.isConfigured()) {
    console.error('❌ SMTP is NOT fully configured in .env!');
    console.error('   Please provide SMTP_USER and SMTP_PASSWORD in your .env file.\n');
    console.error('   For Gmail (devhousesoftware.inc@gmail.com):');
    console.error('     1. Enable 2-Step Verification in Google Account');
    console.error('     2. Generate a 16-character App Password');
    console.error('     3. Set SMTP_HOST=smtp.gmail.com');
    console.error('     4. Set SMTP_PORT=465 (hoặc 587)');
    console.error('     5. Set SMTP_USER=devhousesoftware.inc@gmail.com');
    console.error('     6. Set SMTP_PASSWORD=<16-char-app-password>');
    console.error('     7. Set MAIL_FROM="Dev House Software <devhousesoftware.inc@gmail.com>"\n');
    process.exit(1);
  }

  console.log('1. Verifying SMTP connection to server...');
  const verifyResult = await mailer.verifyConnection();

  if (!verifyResult.verified) {
    console.error(`❌ SMTP Connection Failed: ${verifyResult.error}\n`);
    console.error('Troubleshooting Tips:');
    console.error('  - If "EAUTH" or "Invalid login": Ensure you are using a 16-character Google App Password, NOT your regular Gmail password.');
    console.error('  - If "ETIMEDOUT" or "ECONNREFUSED": Port may be blocked by your server/VPS firewall. Try port 465 (SSL) or 587 (TLS).');
    process.exit(1);
  }

  console.log('✅ SMTP Server Connection: VERIFIED SUCCESSFULLY!\n');

  const targetEmail = process.argv[2] || config.CONTACT_NOTIFY_TO || config.SMTP_USER;
  console.log(`2. Sending test email to: ${targetEmail}...`);

  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  try {
    const result = await mailer.sendMail({
      to: targetEmail,
      subject: `[Dev House] Kiểm tra hệ thống gửi Mail (${now})`,
      text: `Chào bạn,\n\nĐây là email kiểm tra từ hệ thống Dev House Software gửi qua SMTP lúc ${now}.\nHệ thống đã sẵn sàng tiếp nhận thông tin khách hàng liên hệ tư vấn!\n\nTrân trọng,\nDev House Software`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">Dev House Software — Test Email</h2>
          <p>Xin chào,</p>
          <p>Email này xác nhận hệ thống gửi mail SMTP của <strong>Dev House Software</strong> đã hoạt động hoàn toàn chính xác.</p>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 14px; margin: 16px 0;">
            <strong>Thời gian gửi:</strong> ${now}<br>
            <strong>Tài khoản gửi:</strong> ${config.SMTP_USER}<br>
            <strong>Người nhận:</strong> ${targetEmail}
          </div>
          <p style="color: #64748b; font-size: 13px;">Chúc mừng bạn! Form Liên hệ tư vấn trên website hiện đã sẵn sàng gửi nhận email thực tế.</p>
        </div>
      `,
    });

    console.log(`✅ Email sent successfully! Message ID: ${result.messageId}`);
    console.log(`📬 Please check the inbox of ${targetEmail} (cả thư mục Spam nếu là lần đầu).\n`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Failed to send email: ${err.message}\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
