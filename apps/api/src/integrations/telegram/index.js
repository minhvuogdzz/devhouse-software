import { config } from '../../config/index.js';
import { logger } from '../../core/logger/index.js';

const TIMELINES = {
  urgent: 'Càng sớm càng tốt',
  oneMonth: 'Trong vòng 1 tháng',
  threeMonths: 'Từ 1 đến 3 tháng',
  exploring: 'Chưa gấp, đang tìm hiểu',
};

const escapeHtml = value =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const clip = (value, max) => {
  const text = String(value ?? '').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

/** The red-alert message posted to the team chat for a new contact request (Telegram HTML). */
export function buildContactAlert({ contactDoc, serviceName }) {
  const when = new Date(contactDoc.createdAt || Date.now()).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
  });
  const phoneDigits = String(contactDoc.phone || '').replace(/[^+\d]/g, '');
  const rows = [
    ['👤 Tên', contactDoc.name],
    ['📞 Điện thoại', contactDoc.phone],
    ['✉️ Email', contactDoc.email],
    ['🏢 Công ty', contactDoc.company],
    ['🧩 Dịch vụ', serviceName || contactDoc.serviceName],
    ['⏱ Thời gian', TIMELINES[contactDoc.timeline] || contactDoc.timeline],
    ['💰 Ngân sách', contactDoc.budget],
  ].filter(([, value]) => value);

  const lines = [
    '🔴🔴 <b>YÊU CẦU LIÊN HỆ MỚI</b> 🔴🔴',
    `<i>${escapeHtml(when)}</i>`,
    '',
    ...rows.map(([label, value]) => `${label}: <b>${escapeHtml(clip(value, 120))}</b>`),
  ];
  if (contactDoc.message) {
    lines.push('', '💬 <b>Nội dung</b>', escapeHtml(clip(contactDoc.message, 1500)));
  }
  if (contactDoc.meta?.pageUrl) {
    lines.push('', `🔗 Gửi từ: ${escapeHtml(clip(contactDoc.meta.pageUrl, 200))}`);
  }
  lines.push('', '⚡ Gọi lại cho khách trong 24 giờ làm việc.');

  // Telegram only accepts public https links on buttons (not localhost).
  const buttons = [];
  if (/^https:\/\//.test(config.ADMIN_URL)) {
    buttons.push([
      { text: '📂 Mở trong admin', url: `${config.ADMIN_URL}/contact-requests/${contactDoc._id}` },
    ]);
  }
  if (phoneDigits) {
    buttons.push([{ text: `💬 Zalo ${contactDoc.phone}`, url: `https://zalo.me/${phoneDigits}` }]);
  }
  return { text: lines.join('\n'), buttons };
}

export const telegram = {
  isConfigured() {
    return Boolean(config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_CHAT_ID);
  },

  /** Posts the alert. Never throws; returns { sent } so callers can log the outcome. */
  async sendContactAlert({ contactDoc, serviceName }) {
    if (!this.isConfigured()) {
      return { sent: false, reason: 'not_configured' };
    }
    const { text, buttons } = buildContactAlert({ contactDoc, serviceName });
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            chat_id: config.TELEGRAM_CHAT_ID,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            ...(buttons.length ? { reply_markup: { inline_keyboard: buttons } } : {}),
          }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        logger.error(`Telegram contact alert failed: HTTP ${res.status} ${body.slice(0, 200)}`);
        return { sent: false, reason: `http_${res.status}` };
      }
      return { sent: true };
    } catch (err) {
      logger.error(`Telegram contact alert failed: ${err.message}`);
      return { sent: false, reason: 'network' };
    }
  },
};
