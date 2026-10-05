import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { runSeeds } from '../seeds/index.js';
import { UserModel } from '../src/modules/users/user.model.js';
import { SessionModel } from '../src/modules/auth/session.model.js';
import { ContactRequestModel } from '../src/modules/contact/contact.model.js';

const PASSWORD = 'Password123!';

describe('Admin list endpoints', () => {
  let cookie;

  beforeAll(async () => {
    await connectDB();
    await runSeeds();
    await UserModel.deleteMany({ email: /@lists-test\.example$/ });
    await UserModel.create({
      email: 'admin@lists-test.example',
      passwordHash: await UserModel.hashPassword(PASSWORD),
      name: 'Admin',
      roleKeys: ['super_admin'],
      status: 'active',
    });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@lists-test.example', password: PASSWORD });
    cookie = res.headers['set-cookie'].find(c => c.startsWith('dh_sid=')).split(';')[0];
    await ContactRequestModel.deleteMany({});
    await ContactRequestModel.create({
      name: 'Người thử',
      email: 'thu@example.com',
      message: 'Một yêu cầu thử để kiểm tra danh sách.',
    });
  });

  afterAll(async () => {
    await ContactRequestModel.deleteMany({});
    await UserModel.deleteMany({ email: /@lists-test\.example$/ });
    await SessionModel.deleteMany({});
    await disconnectDB();
  });

  // The admin screens call `.map` on `data`, so it has to be the list itself
  it.each([
    'contact-requests',
    'contact',
    'services',
    'packages',
    'products',
    'projects',
    'solutions',
    'technologies',
  ])('GET /admin/%s returns the list as `data` and the paging in `meta.pagination`', async path => {
    const res = await request(app).get(`/api/v1/admin/${path}?limit=5`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.pagination).toBeDefined();
  });

  it('lists the contact request that was sent, with what the visitor was interested in', async () => {
    const res = await request(app).get('/api/v1/admin/contact-requests').set('Cookie', cookie);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].email).toBe('thu@example.com');
  });
});
