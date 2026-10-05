import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { runSeeds } from '../seeds/index.js';
import { UserModel } from '../src/modules/users/user.model.js';
import { SessionModel } from '../src/modules/auth/session.model.js';
import { ProjectModel } from '../src/modules/projects/project.model.js';
import { CategoryModel } from '../src/modules/categories/category.model.js';

const PASSWORD = 'Password123!';
const thumb = n => ({
  url: `https://res.cloudinary.com/demo/image/upload/${n}.webp`,
  publicId: `p/${n}`,
});

describe('Projects (set up like website templates)', () => {
  let adminCookie;
  let segment;
  let category;

  beforeAll(async () => {
    await connectDB();
    await runSeeds();
    const passwordHash = await UserModel.hashPassword(PASSWORD);
    await UserModel.deleteMany({ email: /@proj-test\.example$/ });
    await UserModel.create({
      email: 'admin@proj-test.example',
      passwordHash,
      name: 'Admin',
      roleKeys: ['super_admin'],
      status: 'active',
    });
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@proj-test.example', password: PASSWORD });
    adminCookie = res.headers['set-cookie'].find(c => c.startsWith('dh_sid=')).split(';')[0];
    await ProjectModel.deleteMany({});
    segment = await CategoryModel.findOne({ type: 'project-segment', 'slug.vi': 'website' });
    category = await CategoryModel.findOne({ type: 'project', 'slug.vi': 'landing-page' });
  });

  afterAll(async () => {
    await ProjectModel.deleteMany({});
    await UserModel.deleteMany({ email: /@proj-test\.example$/ });
    await SessionModel.deleteMany({});
    await disconnectDB();
  });

  const payload = (overrides = {}) => ({
    title: { vi: 'Dự án thử một', en: 'Test project one' },
    shortDescription: { vi: 'Mô tả ngắn', en: 'Short text' },
    thumbnails: [thumb('a'), thumb('b')],
    segment: segment._id.toString(),
    category: category._id.toString(),
    rating: 4.5,
    views: 120,
    demoUrl: 'https://demo.example.com',
    isFeatured: true,
    order: 1,
    status: 'published',
    ...overrides,
  });

  it('seeds project segments and types, but no projects', async () => {
    const segments = await CategoryModel.find({ type: 'project-segment' }).lean();
    const types = await CategoryModel.find({ type: 'project' }).lean();
    expect(segments.length).toBeGreaterThanOrEqual(4);
    expect(types.length).toBeGreaterThanOrEqual(5);
    expect(await ProjectModel.countDocuments({})).toBe(0);
  });

  it('creates a project with card pictures, segment, rating, views and a demo link', async () => {
    const res = await request(app)
      .post('/api/v1/admin/projects')
      .set('Cookie', adminCookie)
      .send(payload());
    expect(res.status).toBe(201);
    expect(res.body.data.thumbnails).toHaveLength(2);
    expect(res.body.data.rating).toBe(4.5);
    expect(res.body.data.demoUrl).toBe('https://demo.example.com');
  });

  it('rejects more than 3 pictures, a rating above 5 and a demo link that is not https', async () => {
    const send = body =>
      request(app).post('/api/v1/admin/projects').set('Cookie', adminCookie).send(body);
    expect(
      (await send(payload({ thumbnails: [thumb('1'), thumb('2'), thumb('3'), thumb('4')] })))
        .status,
    ).toBe(422);
    expect((await send(payload({ rating: 5.5 }))).status).toBe(422);
    expect((await send(payload({ demoUrl: 'http://example.com/demo' }))).status).toBe(422);
    expect((await send(payload({ demoUrl: 'javascript:alert(1)' }))).status).toBe(422);
    expect((await send(payload({ title: { vi: '', en: 'x' } }))).status).toBe(422);
  });

  it('lists published projects publicly with segment and type, and no internal fields', async () => {
    const res = await request(app).get('/api/v1/projects?locale=vi');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    const item = res.body.data[0];
    expect(item.title).toBe('Dự án thử một');
    expect(item.segment.name).toBe('Website');
    expect(item.category.name).toBe('Landing page');
    expect(item.thumbnails).toHaveLength(2);
    for (const key of ['__v', 'createdBy', 'updatedBy', 'isDeleted', 'deletedAt', 'deletedBy']) {
      expect(item).not.toHaveProperty(key);
    }
  });

  it('filters by segment and type using slugs or ids, and returns nothing for unknown ones', async () => {
    const ok = await request(app).get(
      '/api/v1/projects?locale=vi&segment=website&category=landing-page',
    );
    expect(ok.body.data).toHaveLength(1);
    const byId = await request(app).get(`/api/v1/projects?locale=vi&category=${category._id}`);
    expect(byId.body.data).toHaveLength(1);
    const wrongSegment = await request(app).get('/api/v1/projects?locale=vi&segment=game');
    expect(wrongSegment.body.data).toHaveLength(0);
    const unknown = await request(app).get('/api/v1/projects?locale=vi&segment=does-not-exist');
    expect(unknown.body.data).toHaveLength(0);
  });

  it('only lists a project in English once its English text is filled in', async () => {
    await request(app)
      .post('/api/v1/admin/projects')
      .set('Cookie', adminCookie)
      .send(
        payload({
          title: { vi: 'Chỉ có tiếng Việt', en: '' },
          shortDescription: { vi: 'Mô tả', en: '' },
          order: 2,
        }),
      );
    const vi = await request(app).get('/api/v1/projects?locale=vi');
    const en = await request(app).get('/api/v1/projects?locale=en');
    expect(vi.body.data).toHaveLength(2);
    expect(en.body.data.map(p => p.title)).toEqual(['Test project one']);
  });

  it('shows the old cover image as the card picture for projects made before card pictures', async () => {
    await ProjectModel.create({
      title: { vi: 'Dự án cũ', en: 'Old project' },
      shortDescription: { vi: 'Cũ', en: 'Old' },
      coverImage: {
        url: 'https://res.cloudinary.com/demo/image/upload/old.webp',
        publicId: 'p/old',
      },
      status: 'published',
      publishedAt: new Date('2026-01-01'),
      order: 9,
    });
    const res = await request(app).get('/api/v1/projects/du-an-cu?locale=vi');
    expect(res.status).toBe(200);
    expect(res.body.data.thumbnails).toHaveLength(1);
    expect(res.body.data.thumbnails[0].url).toContain('old.webp');
  });

  it('still hides the client name and logo when the client is confidential', async () => {
    await ProjectModel.create({
      title: { vi: 'Dự án kín', en: 'Private project' },
      shortDescription: { vi: 'Kín', en: 'Private' },
      client: { name: 'Secret Co', isConfidential: true, logo: { url: 'https://x/logo.png' } },
      status: 'published',
      publishedAt: new Date('2026-01-01'),
    });
    const res = await request(app).get('/api/v1/projects/du-an-kin?locale=vi');
    expect(res.body.data.client.name).toBe('');
  });

  it('returns 404 for an unknown project', async () => {
    const res = await request(app).get('/api/v1/projects/khong-co?locale=vi');
    expect(res.status).toBe(404);
  });

  it('accepts a reorder request (the route must not be mistaken for an id)', async () => {
    const projects = await ProjectModel.find({}).sort({ order: 1 }).lean();
    const res = await request(app)
      .patch('/api/v1/admin/projects/reorder')
      .set('Cookie', adminCookie)
      .send({ items: projects.map((p, index) => ({ id: p._id.toString(), order: 10 - index })) });
    expect(res.status).toBeLessThan(400);
  });

  it('blocks deleting a project segment or type that a project uses', async () => {
    const seg = await request(app)
      .delete(`/api/v1/admin/categories/${segment._id}`)
      .set('Cookie', adminCookie);
    expect(seg.status).toBe(409);
    const cat = await request(app)
      .delete(`/api/v1/admin/categories/${category._id}`)
      .set('Cookie', adminCookie);
    expect(cat.status).toBe(409);
  });

  it('counts the projects in each segment in the admin category list', async () => {
    const res = await request(app)
      .get('/api/v1/admin/categories?type=project-segment')
      .set('Cookie', adminCookie);
    const website = res.body.data.find(c => c.slug.vi === 'website');
    expect(website.itemCount).toBeGreaterThanOrEqual(1);
  });
});
