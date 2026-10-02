import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { adminRouter } from '../src/routes.js';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { runSeeds } from '../seeds/index.js';
import { UserModel } from '../src/modules/users/user.model.js';
import { SessionModel } from '../src/modules/auth/session.model.js';

describe('Auth & RBAC', () => {
  let superAdminUser;
  let _adminUser;
  let _editorUser;
  let testPassword = 'Password123!';
  let superAdminCookie;
  let adminCookie;
  let editorCookie;

  beforeAll(async () => {
    await connectDB();
    await runSeeds();

    // Clean up test users
    await UserModel.deleteMany({
      email: {
        $in: [
          'test-sa@devhouse.example',
          'test-adm@devhouse.example',
          'test-ed@devhouse.example',
          'test-locked@devhouse.example',
        ],
      },
    });
    await SessionModel.deleteMany({});

    const passwordHash = await bcrypt.hash(testPassword, 10);

    superAdminUser = await UserModel.create({
      email: 'test-sa@devhouse.example',
      passwordHash,
      name: 'Test Super Admin',
      roleKeys: ['super_admin'],
      status: 'active',
    });

    _adminUser = await UserModel.create({
      email: 'test-adm@devhouse.example',
      passwordHash,
      name: 'Test Admin',
      roleKeys: ['admin'],
      status: 'active',
    });

    _editorUser = await UserModel.create({
      email: 'test-ed@devhouse.example',
      passwordHash,
      name: 'Test Editor',
      roleKeys: ['editor'],
      status: 'active',
    });
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: {
        $in: [
          'test-sa@devhouse.example',
          'test-adm@devhouse.example',
          'test-ed@devhouse.example',
          'test-locked@devhouse.example',
        ],
      },
    });
    await SessionModel.deleteMany({});
    await disconnectDB();
  });

  describe('Authentication flow', () => {
    it('Login success returns 200 and sets session cookie', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test-sa@devhouse.example', password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test-sa@devhouse.example');
      expect(res.body.data.user.roleKeys).toContain('super_admin');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const sessionCookie = cookies.find(c => c.startsWith('dh_sid='));
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie).toContain('HttpOnly');

      superAdminCookie = sessionCookie.split(';')[0];
    });

    it('Failed login with invalid credentials returns 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test-sa@devhouse.example', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Account lockout after 5 consecutive failures', async () => {
      const passwordHash = await bcrypt.hash(testPassword, 10);
      await UserModel.create({
        email: 'test-locked@devhouse.example',
        passwordHash,
        name: 'Lockout Test',
        roleKeys: ['editor'],
        status: 'active',
      });

      // 4 failures
      for (let i = 0; i < 4; i++) {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: 'test-locked@devhouse.example', password: 'wrongpassword' });
        expect(res.status).toBe(401);
        expect(res.body.error.code).toBe('UNAUTHORIZED');
      }

      // 5th failure triggers lockout
      const fifth = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test-locked@devhouse.example', password: 'wrongpassword' });
      expect(fifth.status).toBe(423);
      expect(fifth.body.error.code).toBe('ACCOUNT_LOCKED');

      // Subsequent attempt with right password is still locked
      const sixth = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test-locked@devhouse.example', password: testPassword });
      expect(sixth.status).toBe(423);
      expect(sixth.body.error.code).toBe('ACCOUNT_LOCKED');
    });

    it('GET /api/v1/auth/me returns current user info when authenticated', async () => {
      const res = await request(app).get('/api/v1/auth/me').set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('test-sa@devhouse.example');
      expect(res.body.data.permissions).toContain('*');
    });

    it('Expired or invalid session returns 401', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', ['dh_sid=invalid-token-string']);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('Logout clears cookie and invalidates session in database', async () => {
      // Login first to get a disposable session
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test-sa@devhouse.example', password: testPassword });
      const cookie = loginRes.headers['set-cookie']
        .find(c => c.startsWith('dh_sid='))
        .split(';')[0];

      // Logout
      const logoutRes = await request(app).post('/api/v1/auth/logout').set('Cookie', [cookie]);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Verify cookie is cleared
      const logoutCookies = logoutRes.headers['set-cookie'];
      const clearedCookie = logoutCookies.find(c => c.startsWith('dh_sid='));
      expect(clearedCookie).toBeDefined();

      // Using the old cookie now fails
      const meRes = await request(app).get('/api/v1/auth/me').set('Cookie', [cookie]);
      expect(meRes.status).toBe(401);
    });
  });

  describe('RBAC & Escalation Guards', () => {
    beforeAll(async () => {
      // Login as admin
      const adminLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test-adm@devhouse.example', password: testPassword });
      adminCookie = adminLogin.headers['set-cookie']
        .find(c => c.startsWith('dh_sid='))
        .split(';')[0];

      // Login as editor
      const editorLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test-ed@devhouse.example', password: testPassword });
      editorCookie = editorLogin.headers['set-cookie']
        .find(c => c.startsWith('dh_sid='))
        .split(';')[0];
    });

    it('Editor cannot access user management (missing users:read permission)', async () => {
      const res = await request(app).get('/api/v1/admin/users').set('Cookie', [editorCookie]);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Admin cannot assign super_admin role (privilege escalation prevention)', async () => {
      const res = await request(app)
        .post('/api/v1/admin/users')
        .set('Cookie', [adminCookie])
        .send({
          email: 'escalation-test@devhouse.example',
          name: 'Escalation Test',
          roleKeys: ['super_admin'],
          password: 'Password123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain('higher permissions');
    });

    it('User cannot change own roles', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${superAdminUser._id}`)
        .set('Cookie', [superAdminCookie])
        .send({ roleKeys: ['editor'] });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toMatch(/own roles/);
    });

    it('User cannot disable self', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${superAdminUser._id}`)
        .set('Cookie', [superAdminCookie])
        .send({ status: 'disabled' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('User cannot delete self', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${superAdminUser._id}`)
        .set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('Cannot demote or delete the last super_admin', async () => {
      // adminUser tries to delete superAdminUser, who is the only super_admin
      const res = await request(app)
        .delete(`/api/v1/admin/users/${superAdminUser._id}`)
        .set('Cookie', [adminCookie]);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('Admin Router Walk Verification', () => {
    it('asserts every /api/v1/admin/* route has authenticate and requirePermission', () => {
      // 1. Verify adminRouter itself enforces authenticate as its root middleware
      const rootMiddlewares = adminRouter.stack
        .filter(layer => !layer.route && layer.name !== 'router')
        .map(layer => layer.name);

      expect(rootMiddlewares).toContain('authenticate');

      // 2. Walk all sub-routers of adminRouter and assert every route has requirePermission
      const unshieldedRoutes = [];

      for (const layer of adminRouter.stack) {
        if (layer.handle?.stack) {
          for (const routeLayer of layer.handle.stack) {
            if (routeLayer.route) {
              const route = routeLayer.route;
              const hasPermissionMiddleware = route.stack.some(
                handler =>
                  handler.name === 'requirePermissionMiddleware' ||
                  handler.name === 'requirePermission',
              );

              if (!hasPermissionMiddleware) {
                unshieldedRoutes.push({
                  path: route.path,
                  methods: Object.keys(route.methods),
                });
              }
            }
          }
        }
      }

      expect(unshieldedRoutes).toEqual([]);
    });
  });
});
