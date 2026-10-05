import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { defaultServices, defaultServiceTypes } from '@devhouse/content';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { runSeeds } from '../seeds/index.js';
import { UserModel } from '../src/modules/users/user.model.js';
import { SessionModel } from '../src/modules/auth/session.model.js';
import { ServiceModel } from '../src/modules/services/service.model.js';

const PASSWORD = 'Password123!';

describe('Service groups and the kinds of service inside them', () => {
  let cookie;

  beforeAll(async () => {
    await connectDB();
    await runSeeds();
    await UserModel.deleteMany({ email: /@tree-test\.example$/ });
    await UserModel.create({
      email: 'admin@tree-test.example',
      passwordHash: await UserModel.hashPassword(PASSWORD),
      name: 'Admin',
      roleKeys: ['super_admin'],
      status: 'active',
    });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@tree-test.example', password: PASSWORD });
    cookie = res.headers['set-cookie'].find(c => c.startsWith('dh_sid=')).split(';')[0];
  });

  afterAll(async () => {
    await ServiceModel.deleteMany({ 'slug.vi': /^thu-/ });
    await UserModel.deleteMany({ email: /@tree-test\.example$/ });
    await SessionModel.deleteMany({});
    await disconnectDB();
  });

  it('seeds every kind of service under the right group, each with its own setup steps', async () => {
    const groups = await ServiceModel.find({ parent: null, 'slug.vi': { $not: /^thu-/ } }).lean();
    expect(groups).toHaveLength(defaultServices.length);

    const types = await ServiceModel.find({ parent: { $ne: null } }).lean();
    expect(types).toHaveLength(defaultServiceTypes.length);
    expect(types.length).toBeGreaterThanOrEqual(15);

    const groupBySlug = new Map(groups.map(g => [g.slug.vi, g]));
    for (const item of types) {
      const expected = defaultServiceTypes.find(t => t.slug.vi === item.slug.vi);
      expect(groupBySlug.get(expected.parentSlug)._id.toString()).toBe(item.parent.toString());
      expect(item.process.length).toBeGreaterThanOrEqual(3);
      expect(item.status).toBe('published');
      expect(item.locales).toEqual(['vi', 'en']);
    }
    for (const group of groups) expect(group.process.length).toBeGreaterThanOrEqual(3);
  });

  it('lists only the groups with ?parent=none and the types of one group by its slug', async () => {
    const groups = await request(app).get('/api/v1/services?locale=vi&parent=none');
    expect(groups.body.data.map(g => g.name)).toEqual([
      'Thiết kế website',
      'Máy chủ và hạ tầng đám mây',
      'Tên miền và DNS',
      'Bảo mật và hỗ trợ',
    ]);

    const inside = await request(app).get('/api/v1/services?locale=vi&parent=thiet-ke-website');
    expect(inside.body.data.map(s => s.name)).toEqual([
      'Landing page',
      'Website giới thiệu doanh nghiệp',
      'Website bán hàng nhỏ',
      'Cửa hàng trên Shopify',
      'Website đồ án sinh viên',
    ]);
    for (const item of inside.body.data) {
      expect(item.parent.slug).toBe('thiet-ke-website');
    }

    const unknown = await request(app).get('/api/v1/services?locale=vi&parent=khong-co');
    expect(unknown.body.data).toEqual([]);
  });

  it('opens a kind of service with its setup steps, its points and the group it belongs to', async () => {
    const res = await request(app).get('/api/v1/services/landing-page?locale=vi');
    expect(res.status).toBe(200);
    expect(res.body.data.parent.name).toBe('Thiết kế website');
    expect(res.body.data.process.length).toBeGreaterThanOrEqual(3);
    expect(res.body.data.process[0].title).toBeTruthy();
    expect(res.body.data.features.length).toBeGreaterThan(0);

    const en = await request(app).get('/api/v1/services/landing-page?locale=en');
    expect(en.body.data.parent.name).toBe('Website design');
  });

  it('keeps the structure to two levels', async () => {
    const group = await ServiceModel.findOne({ 'slug.vi': 'thiet-ke-website' });
    const type = await ServiceModel.findOne({ 'slug.vi': 'landing-page' });
    const create = body =>
      request(app)
        .post('/api/v1/admin/services')
        .set('Cookie', cookie)
        .send({
          name: { vi: 'Thử một dạng', en: 'Test kind' },
          shortDescription: { vi: 'Mô tả', en: 'Text' },
          status: 'draft',
          ...body,
        });

    const ok = await create({ parent: group._id.toString() });
    expect(ok.status).toBe(201);
    expect(ok.body.data.parent).toBe(group._id.toString());

    // A type cannot be a group for other types
    const deeper = await create({ parent: type._id.toString() });
    expect(deeper.status).toBeGreaterThanOrEqual(400);
    expect(deeper.status).toBeLessThan(500);

    // A group that has services inside cannot be placed inside another group
    const other = await ServiceModel.findOne({ 'slug.vi': 'ten-mien-va-dns' });
    const move = await request(app)
      .patch(`/api/v1/admin/services/${group._id}`)
      .set('Cookie', cookie)
      .send({ parent: other._id.toString() });
    expect(move.status).toBeGreaterThanOrEqual(400);
    expect(move.status).toBeLessThan(500);

    // Nothing can be its own group
    const self = await request(app)
      .patch(`/api/v1/admin/services/${ok.body.data._id}`)
      .set('Cookie', cookie)
      .send({ parent: ok.body.data._id });
    expect(self.status).toBeGreaterThanOrEqual(400);
    expect(self.status).toBeLessThan(500);

    await ServiceModel.deleteMany({ _id: ok.body.data._id });
  });

  it('refuses to delete a group that still has services inside it', async () => {
    const group = await ServiceModel.findOne({ 'slug.vi': 'ten-mien-va-dns' });
    const res = await request(app)
      .delete(`/api/v1/admin/services/${group._id}`)
      .set('Cookie', cookie);
    expect(res.status).toBe(409);
    expect(await ServiceModel.countDocuments({ _id: group._id, isDeleted: false })).toBe(1);
  });

  it('lets an admin filter the admin list by group', async () => {
    const res = await request(app)
      .get('/api/v1/admin/services?parent=ten-mien-va-dns&limit=50')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(4);
  });

  it('adds missing setup steps to an older group once, and never overwrites what an admin changed', async () => {
    // A group saved by an earlier release has no `process` key at all
    await ServiceModel.collection.updateOne(
      { 'slug.vi': 'bao-mat-va-ho-tro' },
      { $unset: { process: 1 } },
    );
    await runSeeds();
    let group = await ServiceModel.findOne({ 'slug.vi': 'bao-mat-va-ho-tro' }).lean();
    expect(group.process.length).toBeGreaterThanOrEqual(3);

    // The admin empties the steps and renames a type: later seeds leave both alone
    await ServiceModel.collection.updateOne(
      { 'slug.vi': 'bao-mat-va-ho-tro' },
      { $set: { process: [] } },
    );
    await ServiceModel.updateOne(
      { 'slug.vi': 'xu-ly-su-co' },
      { $set: { 'name.vi': 'Tên do admin sửa' } },
    );
    await runSeeds();
    group = await ServiceModel.findOne({ 'slug.vi': 'bao-mat-va-ho-tro' }).lean();
    expect(group.process).toEqual([]);
    const renamed = await ServiceModel.findOne({ 'slug.vi': 'xu-ly-su-co' }).lean();
    expect(renamed.name.vi).toBe('Tên do admin sửa');
    expect(await ServiceModel.countDocuments({ 'slug.vi': 'xu-ly-su-co' })).toBe(1);
  });
});
