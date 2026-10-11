import { describe, it, expect, afterEach, vi } from 'vitest';
import { telegram, buildContactAlert } from '../src/integrations/telegram/index.js';
import { config } from '../src/config/index.js';

const contactDoc = {
  _id: '6acb0928e4a034dbc2ab6a5e',
  name: 'Nguyễn <Văn> A',
  phone: '0900 000 000',
  email: 'khach@example.com',
  company: 'Mây Coffee',
  timeline: 'urgent',
  message: 'Cần website quán cà phê & đặt bàn',
  meta: { pageUrl: 'https://devhouse.vn/contact' },
  createdAt: new Date('2026-10-11T03:00:00Z'),
};

describe('Telegram contact alert', () => {
  const original = {
    token: config.TELEGRAM_BOT_TOKEN,
    chat: config.TELEGRAM_CHAT_ID,
    admin: config.ADMIN_URL,
  };

  afterEach(() => {
    config.TELEGRAM_BOT_TOKEN = original.token;
    config.TELEGRAM_CHAT_ID = original.chat;
    config.ADMIN_URL = original.admin;
    vi.unstubAllGlobals();
  });

  it('builds a red alert with the request details, HTML-escaped', () => {
    config.ADMIN_URL = 'https://admin.devhouse.vn';
    const { text, buttons } = buildContactAlert({ contactDoc, serviceName: 'Thiết kế website' });
    expect(text).toContain('YÊU CẦU LIÊN HỆ MỚI');
    expect(text).toContain('Nguyễn &lt;Văn&gt; A');
    expect(text).toContain('quán cà phê &amp; đặt bàn');
    expect(text).toContain('Thiết kế website');
    expect(text).toContain('Càng sớm càng tốt');
    expect(text).toContain('11/10/2026');
    expect(buttons[0][0].url).toBe(
      'https://admin.devhouse.vn/contact-requests/6acb0928e4a034dbc2ab6a5e',
    );
    expect(buttons[1][0].url).toBe('https://zalo.me/0900000000');
  });

  it('leaves out the admin button when the admin URL is not public https', () => {
    config.ADMIN_URL = 'http://localhost:5173';
    const { buttons } = buildContactAlert({ contactDoc: { ...contactDoc, phone: '' } });
    expect(buttons).toEqual([]);
  });

  it('does nothing when the bot is not configured', async () => {
    config.TELEGRAM_BOT_TOKEN = '';
    config.TELEGRAM_CHAT_ID = '';
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await telegram.sendContactAlert({ contactDoc })).toEqual({
      sent: false,
      reason: 'not_configured',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts to the configured chat and reports failures without throwing', async () => {
    config.TELEGRAM_BOT_TOKEN = '123:abc';
    config.TELEGRAM_CHAT_ID = '-10042';
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    expect(await telegram.sendContactAlert({ contactDoc })).toEqual({ sent: true });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.telegram.org/bot123:abc/sendMessage');
    const body = JSON.parse(init.body);
    expect(body.chat_id).toBe('-10042');
    expect(body.parse_mode).toBe('HTML');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await telegram.sendContactAlert({ contactDoc })).toEqual({
      sent: false,
      reason: 'network',
    });
  });
});
