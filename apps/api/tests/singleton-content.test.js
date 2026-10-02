import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { runSeeds } from '../seeds/index.js';
import { UserModel } from '../src/modules/users/user.model.js';
import { SessionModel } from '../src/modules/auth/session.model.js';
import { PageModel } from '../src/modules/content/page.model.js';
import { SettingsModel } from '../src/modules/settings/settings.model.js';

describe('Singleton Content (Pages, Settings, Navigation)', () => {
  let superAdminCookie;
  let supportCookie;
  let testPassword = 'Password123!';

  beforeAll(async () => {
    await connectDB();
    await runSeeds();

    const passwordHash = await bcrypt.hash(testPassword, 10);

    await UserModel.deleteMany({
      email: { $in: ['content-admin@devhouse.example', 'content-support@devhouse.example'] },
    });

    await UserModel.create({
      email: 'content-admin@devhouse.example',
      passwordHash,
      name: 'Content Admin',
      roleKeys: ['super_admin'],
      status: 'active',
    });

    await UserModel.create({
      email: 'content-support@devhouse.example',
      passwordHash,
      name: 'Content Support',
      roleKeys: ['support'],
      status: 'active',
    });

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'content-admin@devhouse.example', password: testPassword });
    superAdminCookie = adminLogin.headers['set-cookie']
      .find(c => c.startsWith('dh_sid='))
      .split(';')[0];

    const supportLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'content-support@devhouse.example', password: testPassword });
    supportCookie = supportLogin.headers['set-cookie']
      .find(c => c.startsWith('dh_sid='))
      .split(';')[0];
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: { $in: ['content-admin@devhouse.example', 'content-support@devhouse.example'] },
    });
    await SessionModel.deleteMany({});
    await PageModel.updateOne({ key: 'home' }, { $set: { sections: {} } });
    await SettingsModel.updateOne({ key: 'global' }, { $set: { data: {} } });
    await disconnectDB();
  });

  describe('Public Endpoints', () => {
    it('GET /api/v1/site returns resolved site settings and navigation', async () => {
      const res = await request(app).get('/api/v1/site');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settings.companyName.vi).toBe('Dev House Software');
      expect(res.body.data.navigation.header.length).toBeGreaterThan(0);
      expect(res.body.data.navigation.footer.columns.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/site?locale=en returns localized settings and navigation', async () => {
      const res = await request(app).get('/api/v1/site?locale=en');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.settings.companyName).toBe('string');
      expect(typeof res.body.data.navigation.header[0].label).toBe('string');
    });

    it('GET /api/v1/pages/home returns resolved sections and SEO', async () => {
      const res = await request(app).get('/api/v1/pages/home');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.key).toBe('home');
      expect(res.body.data.sections.hero).toBeDefined();
      expect(res.body.data.sections.hero.heading.vi).toBeDefined();
    });

    it('GET /api/v1/pages/home?locale=vi returns localized strings', async () => {
      const res = await request(app).get('/api/v1/pages/home?locale=vi');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.sections.hero.heading).toBe('string');
      expect(res.body.data.sections.hero.heading.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/pages/non-existent returns 404', async () => {
      const res = await request(app).get('/api/v1/pages/non-existent');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Admin Page Endpoints', () => {
    it('GET /api/v1/admin/pages returns list of registered pages', async () => {
      const res = await request(app).get('/api/v1/admin/pages').set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const home = res.body.data.find(p => p.key === 'home');
      expect(home).toBeDefined();
      expect(home.overriddenSections).toBeDefined();
    });

    it('GET /api/v1/admin/pages/home returns full page definition, defaults and overrides', async () => {
      const res = await request(app)
        .get('/api/v1/admin/pages/home')
        .set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.key).toBe('home');
      expect(res.body.data.defaults.hero).toBeDefined();
      expect(res.body.data.overrides).toBeDefined();
      expect(res.body.data.resolved.hero).toBeDefined();
    });

    it('PUT /api/v1/admin/pages/home updates section overrides and invalidates cache', async () => {
      const customHeading = {
        vi: 'Tiêu đề tuỳ chỉnh mới',
        en: 'New Custom Heading',
      };

      const putRes = await request(app)
        .put('/api/v1/admin/pages/home')
        .set('Cookie', [superAdminCookie])
        .send({
          sections: {
            hero: {
              heading: customHeading,
            },
          },
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.data.overrides.hero.heading.vi).toBe('Tiêu đề tuỳ chỉnh mới');
      expect(putRes.body.data.resolved.hero.heading.vi).toBe('Tiêu đề tuỳ chỉnh mới');

      // Verify public endpoint immediately reflects change (cache invalidated)
      const publicRes = await request(app).get('/api/v1/pages/home?locale=vi');
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.sections.hero.heading).toBe('Tiêu đề tuỳ chỉnh mới');
    });

    it('DELETE /api/v1/admin/pages/home/sections/hero resets hero to default', async () => {
      const deleteRes = await request(app)
        .delete('/api/v1/admin/pages/home/sections/hero')
        .set('Cookie', [superAdminCookie]);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.overrides.hero).toBeUndefined();

      // Verify public endpoint returns default hero heading
      const publicRes = await request(app).get('/api/v1/pages/home?locale=vi');
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.sections.hero.heading).toContain('Xây dựng giải pháp phần mềm');
    });

    it('POST /api/v1/admin/pages/home/reset resets entire page', async () => {
      // Put an override first
      await request(app)
        .put('/api/v1/admin/pages/home')
        .set('Cookie', [superAdminCookie])
        .send({ sections: { hero: { heading: { vi: 'Tạm thời', en: 'Temp' } } } });

      const resetRes = await request(app)
        .post('/api/v1/admin/pages/home/reset')
        .set('Cookie', [superAdminCookie]);

      expect(resetRes.status).toBe(200);
      expect(Object.keys(resetRes.body.data.overrides).length).toBe(0);
    });
  });

  describe('Admin Settings & Navigation Endpoints', () => {
    it('GET & PUT /api/v1/admin/settings updates settings and invalidates cache', async () => {
      const getRes = await request(app)
        .get('/api/v1/admin/settings')
        .set('Cookie', [superAdminCookie]);
      expect(getRes.status).toBe(200);

      const putRes = await request(app)
        .put('/api/v1/admin/settings')
        .set('Cookie', [superAdminCookie])
        .send({
          hotline: '+84 99 8888 7777',
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.data.resolved.hotline).toBe('+84 99 8888 7777');

      // Verify public site endpoint reflects change
      const siteRes = await request(app).get('/api/v1/site');
      expect(siteRes.body.data.settings.hotline).toBe('+84 99 8888 7777');
    });

    it('GET & PUT /api/v1/admin/navigation updates navigation and invalidates cache', async () => {
      const navRes = await request(app)
        .get('/api/v1/admin/navigation')
        .set('Cookie', [superAdminCookie]);
      expect(navRes.status).toBe(200);
      expect(navRes.body.data[0].header).toBeDefined();

      const putRes = await request(app)
        .put('/api/v1/admin/navigation/main')
        .set('Cookie', [superAdminCookie])
        .send({
          header: [{ id: 'custom', label: { vi: 'Tuỳ chỉnh', en: 'Custom' }, path: '/custom' }],
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.data.header[0].id).toBe('custom');

      // Verify public site endpoint reflects change
      const siteRes = await request(app).get('/api/v1/site');
      expect(siteRes.body.data.navigation.header[0].id).toBe('custom');
    });

    it('Support role without settings:update permission gets 403 on PUT /settings', async () => {
      const res = await request(app)
        .put('/api/v1/admin/settings')
        .set('Cookie', [supportCookie])
        .send({ hotline: '+84 00 0000 0000' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
