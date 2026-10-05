import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { runSeeds } from '../seeds/index.js';
import { UserModel } from '../src/modules/users/user.model.js';
import { SessionModel } from '../src/modules/auth/session.model.js';
import { RoleModel } from '../src/modules/roles/role.model.js';
import { ProductModel } from '../src/modules/products/product.model.js';
import { PackageModel } from '../src/modules/packages/package.model.js';
import { CategoryModel } from '../src/modules/categories/category.model.js';
import { NavigationModel } from '../src/modules/navigation/navigation.model.js';
import { PageModel } from '../src/modules/content/page.model.js';

const PASSWORD = 'Password123!';
const thumb = n => ({
  url: `https://res.cloudinary.com/demo/image/upload/${n}.webp`,
  publicId: `p/${n}`,
});

describe('Products, packages and service groups', () => {
  let adminCookie;
  let supportCookie;

  const login = async email => {
    const res = await request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD });
    return res.headers['set-cookie'].find(c => c.startsWith('dh_sid=')).split(';')[0];
  };

  beforeAll(async () => {
    await connectDB();
    await runSeeds();
    const passwordHash = await UserModel.hashPassword(PASSWORD);
    await UserModel.deleteMany({ email: /@pp-test\.example$/ });
    await UserModel.create({
      email: 'admin@pp-test.example',
      passwordHash,
      name: 'Admin',
      roleKeys: ['super_admin'],
      status: 'active',
    });
    await UserModel.create({
      email: 'support@pp-test.example',
      passwordHash,
      name: 'Support',
      roleKeys: ['support'],
      status: 'active',
    });
    adminCookie = await login('admin@pp-test.example');
    supportCookie = await login('support@pp-test.example');
    await ProductModel.deleteMany({});
    await PackageModel.deleteMany({ 'slug.vi': /^test-/ });
  });

  afterAll(async () => {
    await ProductModel.deleteMany({});
    await PackageModel.deleteMany({ 'slug.vi': /^test-/ });
    await UserModel.deleteMany({ email: /@pp-test\.example$/ });
    await SessionModel.deleteMany({});
    await disconnectDB();
  });

  describe('seeded defaults', () => {
    it('seeds the four service groups and three packages', async () => {
      const services = await request(app).get('/api/v1/services?locale=vi&parent=none');
      expect(services.status).toBe(200);
      expect(services.body.data.map(s => s.name)).toEqual([
        'Thiết kế website',
        'Máy chủ và hạ tầng đám mây',
        'Tên miền và DNS',
        'Bảo mật và hỗ trợ',
      ]);
      expect(services.body.data[0].billing).toBe('one_time');
      expect(services.body.data[0].faqs.length).toBeGreaterThan(0);

      const packages = await request(app).get('/api/v1/packages?locale=vi');
      expect(packages.body.data.map(p => p.name)).toEqual([
        'Gói Sinh viên',
        'Gói Cửa hàng',
        'Gói Doanh nghiệp nhỏ',
      ]);
      // Prices are not decided, so none are invented
      for (const pack of packages.body.data) {
        expect(pack.setupFee).toBeNull();
        expect(pack.recurringFee).toBeNull();
      }
    });

    it('seeds the product segments and categories but no products', async () => {
      const segments = await CategoryModel.find({ type: 'product-segment' }).lean();
      const categories = await CategoryModel.find({ type: 'product' }).lean();
      expect(segments.length).toBeGreaterThanOrEqual(4);
      expect(categories.length).toBeGreaterThanOrEqual(5);
      expect(await ProductModel.countDocuments({})).toBe(0);
    });

    it('does not store copies of the default navigation or page SEO', async () => {
      expect(await NavigationModel.countDocuments({})).toBe(0);
      const withSeo = await PageModel.countDocuments({
        'seo.title.vi': { $exists: true, $ne: '' },
      });
      expect(withSeo).toBe(0);
      const site = await request(app).get('/api/v1/site?locale=vi');
      expect(site.body.data.navigation.header.map(i => i.path)).toEqual([
        '/services',
        '/packages',
        '/products',
        '/projects',
        '/#process',
        '/about',
        '/contact',
      ]);
    });

    it('gives the admin and editor roles the new permissions once, without ever removing any', async () => {
      const editor = await RoleModel.findOne({ key: 'editor' });
      expect(editor.permissions).toContain('products:publish');
      expect(editor.permissions).toContain('packages:update');

      // An older role: missing the new permissions and on an earlier revision.
      await RoleModel.updateOne(
        { key: 'editor' },
        {
          $set: { seedRevision: 1 },
          $pull: { permissions: { $in: ['products:read', 'blog:delete'] } },
        },
      );
      await runSeeds();
      let after = await RoleModel.findOne({ key: 'editor' });
      expect(after.permissions).toContain('products:read');
      expect(after.seedRevision).toBeGreaterThanOrEqual(2);

      // A role from before revisions existed has no revision field at all: it catches up too.
      await RoleModel.updateOne(
        { key: 'editor' },
        { $unset: { seedRevision: 1 }, $pull: { permissions: 'products:read' } },
      );
      await runSeeds();
      after = await RoleModel.findOne({ key: 'editor' });
      expect(after.permissions).toContain('products:read');
      expect(after.seedRevision).toBeGreaterThanOrEqual(2);

      // An admin removes a permission afterwards: later seeds must leave it removed.
      await RoleModel.updateOne({ key: 'editor' }, { $pull: { permissions: 'blog:delete' } });
      await runSeeds();
      after = await RoleModel.findOne({ key: 'editor' });
      expect(after.permissions).not.toContain('blog:delete');
    });
  });

  describe('products', () => {
    let segment;
    let category;
    let created;

    beforeAll(async () => {
      segment = await CategoryModel.findOne({ type: 'product-segment', 'slug.vi': 'website' });
      category = await CategoryModel.findOne({ type: 'product', 'slug.vi': 'landing-page' });
    });

    const body = overrides => ({
      name: { vi: 'Mẫu quán cà phê', en: 'Cafe template' },
      shortDescription: { vi: 'Website cho quán cà phê', en: 'A website for a cafe' },
      thumbnails: [thumb(1), thumb(2), thumb(3)],
      segment: segment._id.toString(),
      category: category._id.toString(),
      rating: 4.5,
      views: 1280,
      demoUrl: 'https://demo.example.com/cafe',
      status: 'published',
      ...overrides,
    });

    it('requires authentication and the products permission', async () => {
      const anonymous = await request(app).post('/api/v1/admin/products').send(body());
      expect(anonymous.status).toBe(401);
      const support = await request(app)
        .post('/api/v1/admin/products')
        .set('Cookie', [supportCookie])
        .send(body());
      expect(support.status).toBe(403);
    });

    it('creates a product with three thumbnails, rating, views and a demo link', async () => {
      const res = await request(app)
        .post('/api/v1/admin/products')
        .set('Cookie', [adminCookie])
        .send(body());
      expect(res.status).toBe(201);
      created = res.body.data;
      expect(created.thumbnails).toHaveLength(3);
      expect(created.rating).toBe(4.5);
      expect(created.views).toBe(1280);
      expect(created.slug.vi).toBe('mau-quan-ca-phe');
      expect(created.locales).toEqual(['vi', 'en']);
    });

    it('rejects invalid input with 422', async () => {
      const post = overrides =>
        request(app)
          .post('/api/v1/admin/products')
          .set('Cookie', [adminCookie])
          .send(body(overrides));

      expect((await post({ thumbnails: [1, 2, 3, 4].map(thumb) })).status).toBe(422);
      expect((await post({ rating: 6 })).status).toBe(422);
      expect((await post({ views: -1 })).status).toBe(422);
      expect((await post({ demoUrl: 'http://example.com' })).status).toBe(422);
      expect((await post({ demoUrl: 'javascript:alert(1)' })).status).toBe(422);
      expect((await post({ name: { vi: '', en: 'x' } })).status).toBe(422);
      expect((await post({ segment: 'not-an-id' })).status).toBe(422);
    });

    it('accepts http only for localhost demos', async () => {
      const res = await request(app)
        .post('/api/v1/admin/products')
        .set('Cookie', [adminCookie])
        .send(body({ name: { vi: 'Mẫu cục bộ', en: '' }, demoUrl: 'http://localhost:5000/demo' }));
      expect(res.status).toBe(201);
    });

    it('lists published products publicly with segment, category and no internal fields', async () => {
      const res = await request(app).get('/api/v1/products?locale=vi');
      expect(res.status).toBe(200);
      const item = res.body.data.find(p => p.name === 'Mẫu quán cà phê');
      expect(item.segment.name).toBe('Website');
      expect(item.category.name).toBe('Landing page');
      expect(item.thumbnails).toHaveLength(3);
      expect(item.demoUrl).toBe('https://demo.example.com/cafe');
      for (const hidden of [
        '__v',
        'createdBy',
        'updatedBy',
        'isDeleted',
        'deletedAt',
        'deletedBy',
      ]) {
        expect(item).not.toHaveProperty(hidden);
      }
    });

    it('filters by segment and category using slugs or ids, and returns nothing for unknown ones', async () => {
      const bySlug = await request(app).get(
        '/api/v1/products?locale=vi&segment=website&category=landing-page',
      );
      expect(bySlug.body.data.length).toBeGreaterThan(0);
      const byId = await request(app).get(`/api/v1/products?locale=vi&category=${category._id}`);
      expect(byId.body.data.length).toBeGreaterThan(0);
      const wrongSegment = await request(app).get('/api/v1/products?locale=vi&segment=game');
      expect(wrongSegment.body.data).toHaveLength(0);
      const unknown = await request(app).get('/api/v1/products?locale=vi&segment=does-not-exist');
      expect(unknown.body.data).toHaveLength(0);
    });

    it('only lists a product in a language it is complete in', async () => {
      const onlyVi = await request(app)
        .post('/api/v1/admin/products')
        .set('Cookie', [adminCookie])
        .send(
          body({
            name: { vi: 'Chỉ tiếng Việt', en: '' },
            shortDescription: { vi: 'Mô tả', en: '' },
          }),
        );
      expect(onlyVi.status).toBe(201);
      expect(onlyVi.body.data.locales).toEqual(['vi']);

      const en = await request(app).get('/api/v1/products?locale=en');
      const names = en.body.data.map(p => p.name);
      expect(names).toContain('Cafe template');
      expect(names).not.toContain('Chỉ tiếng Việt');
      const vi = await request(app).get('/api/v1/products?locale=vi');
      expect(vi.body.data.map(p => p.name)).toContain('Chỉ tiếng Việt');
    });

    it('searches by name and treats the search text literally', async () => {
      const found = await request(app).get('/api/v1/products?locale=vi&search=c%C3%A0%20ph%C3%AA');
      expect(found.body.data.map(p => p.name)).toContain('Mẫu quán cà phê');
      const regexLike = await request(app).get('/api/v1/products?locale=vi&search=.*');
      expect(regexLike.body.data).toHaveLength(0);
      const nothing = await request(app).get('/api/v1/products?locale=vi&search=khong-co-gi');
      expect(nothing.body.data).toHaveLength(0);
    });

    it('sorts by the manual order, lowest first', async () => {
      await ProductModel.updateOne({ 'slug.vi': 'mau-quan-ca-phe' }, { $set: { order: 5 } });
      await ProductModel.updateOne({ 'slug.vi': 'chi-tieng-viet' }, { $set: { order: 1 } });
      const res = await request(app).get('/api/v1/products?locale=vi');
      const names = res.body.data.map(p => p.name);
      expect(names.indexOf('Chỉ tiếng Việt')).toBeLessThan(names.indexOf('Mẫu quán cà phê'));
    });

    it('does not list drafts publicly', async () => {
      await request(app)
        .post('/api/v1/admin/products')
        .set('Cookie', [adminCookie])
        .send(body({ name: { vi: 'Bản nháp', en: 'Draft' }, status: 'draft' }));
      const res = await request(app).get('/api/v1/products?locale=vi');
      expect(res.body.data.map(p => p.name)).not.toContain('Bản nháp');
    });

    it('updates only the fields sent', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/products/${created._id}`)
        .set('Cookie', [adminCookie])
        .send({ rating: 3.5, views: 99 });
      expect(res.status).toBe(200);
      expect(res.body.data.rating).toBe(3.5);
      expect(res.body.data.views).toBe(99);
      expect(res.body.data.thumbnails).toHaveLength(3);
      expect(res.body.data.demoUrl).toBe('https://demo.example.com/cafe');
    });

    it('blocks deleting a category that products use', async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/categories/${category._id}`)
        .set('Cookie', [adminCookie]);
      expect(res.status).toBe(409);
    });

    it('lets an admin create their own segment and category', async () => {
      const seg = await request(app)
        .post('/api/v1/admin/categories')
        .set('Cookie', [adminCookie])
        .send({
          type: 'product-segment',
          name: { vi: 'Phần mềm', en: 'Software' },
          slug: { vi: 'phan-mem', en: 'software' },
        });
      expect(seg.status).toBe(201);
      const cat = await request(app)
        .post('/api/v1/admin/categories')
        .set('Cookie', [adminCookie])
        .send({
          type: 'product',
          name: { vi: 'Công cụ', en: 'Tools' },
          slug: { vi: 'cong-cu', en: 'tools' },
        });
      expect(cat.status).toBe(201);
      await CategoryModel.deleteMany({ _id: { $in: [seg.body.data._id, cat.body.data._id] } });
    });
  });

  describe('packages', () => {
    const pack = overrides => ({
      name: { vi: 'Gói thử', en: 'Test package' },
      shortDescription: { vi: 'Mô tả gói', en: 'Package summary' },
      inclusions: [{ text: { vi: 'Tên miền', en: 'Domain' } }],
      status: 'published',
      ...overrides,
    });

    it('creates a package with empty prices and lists it publicly', async () => {
      const res = await request(app)
        .post('/api/v1/admin/packages')
        .set('Cookie', [adminCookie])
        .send(pack({ slug: { vi: 'test-goi-thu', en: 'test-package' } }));
      expect(res.status).toBe(201);
      expect(res.body.data.setupFee).toBeNull();
      expect(res.body.data.recurringFee).toBeNull();

      const list = await request(app).get('/api/v1/packages?locale=en');
      const found = list.body.data.find(p => p.name === 'Test package');
      expect(found.inclusions[0].text).toBe('Domain');
    });

    it('stores prices when an admin sets them and validates them', async () => {
      const created = await PackageModel.findOne({ 'slug.vi': 'test-goi-thu' });
      const ok = await request(app)
        .patch(`/api/v1/admin/packages/${created._id}`)
        .set('Cookie', [adminCookie])
        .send({
          setupFee: 1500000,
          recurringFee: 900000,
          recurringPeriod: 'quarter',
          currency: 'VND',
        });
      expect(ok.status).toBe(200);
      expect(ok.body.data.setupFee).toBe(1500000);
      expect(ok.body.data.recurringPeriod).toBe('quarter');

      const negative = await request(app)
        .patch(`/api/v1/admin/packages/${created._id}`)
        .set('Cookie', [adminCookie])
        .send({ setupFee: -5 });
      expect(negative.status).toBe(422);
      const badPeriod = await request(app)
        .patch(`/api/v1/admin/packages/${created._id}`)
        .set('Cookie', [adminCookie])
        .send({ recurringPeriod: 'month' });
      expect(badPeriod.status).toBe(422);
    });

    it('requires the packages permission', async () => {
      const res = await request(app)
        .post('/api/v1/admin/packages')
        .set('Cookie', [supportCookie])
        .send(pack());
      expect(res.status).toBe(403);
    });
  });

  describe('service groups', () => {
    it('accepts the extended service fields and validates them', async () => {
      const ok = await request(app)
        .post('/api/v1/admin/services')
        .set('Cookie', [adminCookie])
        .send({
          name: { vi: 'Dịch vụ thử nghiệm', en: 'Test service' },
          shortDescription: { vi: 'Mô tả', en: 'Summary' },
          billing: 'yearly',
          icon: 'globe',
          faqs: [{ question: { vi: 'Hỏi?', en: 'Ask?' }, answer: { vi: 'Đáp', en: 'Answer' } }],
          status: 'draft',
        });
      expect(ok.status).toBe(201);
      expect(ok.body.data.billing).toBe('yearly');
      expect(ok.body.data.faqs).toHaveLength(1);

      const bad = await request(app)
        .post('/api/v1/admin/services')
        .set('Cookie', [adminCookie])
        .send({ name: { vi: 'X', en: '' }, billing: 'weekly' });
      expect(bad.status).toBe(422);

      const { ServiceModel } = await import('../src/modules/services/service.model.js');
      await ServiceModel.deleteMany({ 'slug.vi': 'dich-vu-thu-nghiem' });
    });
  });
});
