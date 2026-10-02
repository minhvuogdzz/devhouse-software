import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { runSeeds } from '../seeds/index.js';
import { UserModel } from '../src/modules/users/user.model.js';
import { SessionModel } from '../src/modules/auth/session.model.js';
import { ServiceModel } from '../src/modules/services/service.model.js';
import { TechnologyModel } from '../src/modules/technologies/technology.model.js';
import { ProjectModel } from '../src/modules/projects/project.model.js';
import { CategoryModel } from '../src/modules/categories/category.model.js';
import { RedirectModel } from '../src/modules/redirects/redirect.model.js';

describe('Catalog Modules (Services, Solutions, Projects, Technologies, Categories)', () => {
  let superAdminCookie;
  let testPassword = 'Password123!';

  beforeAll(async () => {
    await connectDB();
    await runSeeds();

    const passwordHash = await bcrypt.hash(testPassword, 10);

    await UserModel.deleteMany({
      email: 'catalog-admin@devhouse.example',
    });
    await ServiceModel.deleteMany({
      'slug.vi': { $in: ['dich-vu-kiem-thu', 'dich-vu-kiem-thu-nang-cao'] },
    });
    await ProjectModel.deleteMany({ 'slug.vi': 'du-an-bao-mat' });
    await RedirectModel.deleteMany({});

    await UserModel.create({
      email: 'catalog-admin@devhouse.example',
      passwordHash,
      name: 'Catalog Admin',
      roleKeys: ['super_admin'],
      status: 'active',
    });

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'catalog-admin@devhouse.example', password: testPassword });
    superAdminCookie = loginRes.headers['set-cookie']
      .find(c => c.startsWith('dh_sid='))
      .split(';')[0];
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: 'catalog-admin@devhouse.example',
    });
    await SessionModel.deleteMany({});
    await ServiceModel.deleteMany({
      'slug.vi': { $in: ['dich-vu-kiem-thu', 'dich-vu-kiem-thu-nang-cao'] },
    });
    await ProjectModel.deleteMany({ 'slug.vi': 'du-an-bao-mat' });
    await RedirectModel.deleteMany({});
    await disconnectDB();
  });

  describe('Public Catalog Endpoints', () => {
    it('GET /api/v1/services returns published services with alternates', async () => {
      const res = await request(app).get('/api/v1/services?locale=vi');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].alternates).toBeDefined();
      expect(res.body.data[0].alternates.vi).toContain('/services/');
      expect(res.body.data[0].alternates.en).toContain('/en/services/');
    });

    it('GET /api/v1/services/:slug returns service details', async () => {
      const service = await ServiceModel.findOne({ status: 'published' }).lean();
      const res = await request(app).get(`/api/v1/services/${service.slug.vi}?locale=vi`);
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe(service.name.vi);
      expect(res.body.data.alternates).toBeDefined();
    });

    it('GET /api/v1/projects omits client name and logo for confidential projects', async () => {
      await ProjectModel.create({
        title: { vi: 'Dự án Bảo mật Ngân hàng', en: 'Banking Security Project' },
        shortDescription: { vi: 'Hệ thống an ninh', en: 'Security platform' },
        client: {
          name: 'Top Secret Bank',
          isConfidential: true,
          logo: { url: 'https://secret.example/logo.png' },
        },
        status: 'published',
        publishedAt: new Date(),
        slug: { vi: 'du-an-bao-mat', en: 'banking-security-project' },
      });

      const res = await request(app).get('/api/v1/projects/du-an-bao-mat?locale=vi');
      expect(res.status).toBe(200);
      expect(res.body.data.client.isConfidential).toBe(true);
      expect(res.body.data.client.name).toBe('');
      expect(res.body.data.client.logo.url).toBeUndefined();
    });

    it('GET /api/v1/technologies?group=category returns technologies grouped by category', async () => {
      const res = await request(app).get('/api/v1/technologies?group=category&locale=vi');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].category).toBeDefined();
      expect(Array.isArray(res.body.data[0].items)).toBeDefined();
    });

    it('GET /api/v1/categories?type=technology returns technology categories', async () => {
      const res = await request(app).get('/api/v1/categories?type=technology&locale=vi');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Catalog Operations & Lifecycle', () => {
    let createdServiceId;

    it('POST /api/v1/admin/services creates a new service', async () => {
      const res = await request(app)
        .post('/api/v1/admin/services')
        .set('Cookie', [superAdminCookie])
        .send({
          name: { vi: 'Dịch vụ Kiểm thử Tự động', en: 'Automated Testing Services' },
          shortDescription: { vi: 'Kiểm thử toàn diện', en: 'Comprehensive test automation' },
          status: 'published',
          slug: { vi: 'dich-vu-kiem-thu', en: 'automated-testing-services' },
          order: 10,
        });

      expect(res.status).toBe(201);
      expect(res.body.data._id).toBeDefined();
      createdServiceId = res.body.data._id;
    });

    it('PATCH /api/v1/admin/services/:id updates service and creates auto-redirect on slug change', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/services/${createdServiceId}`)
        .set('Cookie', [superAdminCookie])
        .send({
          slug: { vi: 'dich-vu-kiem-thu-nang-cao', en: 'advanced-testing-services' },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.slug.vi).toBe('dich-vu-kiem-thu-nang-cao');

      // Check auto-redirect was recorded in redirects collection
      const redirect = await RedirectModel.findOne({
        from: '/services/dich-vu-kiem-thu',
      });
      expect(redirect).toBeDefined();
      expect(redirect.to).toBe('/services/dich-vu-kiem-thu-nang-cao');
      expect(redirect.statusCode).toBe(301);
      expect(redirect.source).toBe('auto');
    });

    it('PATCH /api/v1/admin/services/:id/status updates status and publishedAt', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/services/${createdServiceId}/status`)
        .set('Cookie', [superAdminCookie])
        .send({ status: 'archived' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('archived');
    });

    it('DELETE /api/v1/admin/services/:id soft deletes service', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/services/${createdServiceId}`)
        .set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(204);

      // Verify soft deleted in DB
      const softDeleted = await ServiceModel.findOne({ _id: createdServiceId }).setOptions({
        withDeleted: true,
      });
      expect(softDeleted.isDeleted).toBe(true);
    });

    it('POST /api/v1/admin/services/:id/restore restores service', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/services/${createdServiceId}/restore`)
        .set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.isDeleted).toBe(false);
    });

    it('DELETE /api/v1/admin/technologies/:id rejects deletion when in use (409 RESOURCE_IN_USE)', async () => {
      const tempTech = await TechnologyModel.create({
        name: 'In Use Tech',
        slug: 'in-use-tech',
        order: 99,
        status: 'published',
      });
      await ServiceModel.updateOne({}, { $push: { technologies: tempTech._id } });

      const res = await request(app)
        .delete(`/api/v1/admin/technologies/${tempTech._id}`)
        .set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('RESOURCE_IN_USE');

      await ServiceModel.updateOne({}, { $pull: { technologies: tempTech._id } });
      await TechnologyModel.findByIdAndDelete(tempTech._id);
    });

    it('DELETE /api/v1/admin/categories/:id rejects deletion when in use (409 RESOURCE_IN_USE)', async () => {
      const tempCat = await CategoryModel.create({
        type: 'technology',
        name: { vi: 'In Use Cat', en: 'In Use Cat' },
        slug: { vi: 'in-use-cat', en: 'in-use-cat' },
      });
      const tempTech = await TechnologyModel.create({
        name: 'Cat Tech',
        slug: 'cat-tech',
        category: tempCat._id,
      });

      const res = await request(app)
        .delete(`/api/v1/admin/categories/${tempCat._id}`)
        .set('Cookie', [superAdminCookie]);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('RESOURCE_IN_USE');

      await TechnologyModel.findByIdAndDelete(tempTech._id);
      await CategoryModel.findByIdAndDelete(tempCat._id);
    });
  });
});
