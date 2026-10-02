import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { seoService } from '../src/modules/seo/seo.service.js';
import { redirectService } from '../src/modules/redirects/redirect.service.js';
import { auditLogService } from '../src/modules/audit-logs/audit-log.service.js';
import { dashboardService } from '../src/modules/dashboard/dashboard.service.js';
import { RedirectModel } from '../src/modules/redirects/redirect.model.js';
import { AuditLogModel } from '../src/modules/audit-logs/audit-log.model.js';
import { ServiceModel } from '../src/modules/services/service.model.js';
import { BlogPostModel } from '../src/modules/blog/post.model.js';
import { ContactRequestModel } from '../src/modules/contact/contact.model.js';
import { audit } from '../src/core/audit/index.js';

describe('SEO, Redirects, Audit Logs, and Dashboard (M10)', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhouse_dev';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await RedirectModel.deleteMany({});
    await AuditLogModel.deleteMany({});
    await ServiceModel.deleteMany({});
    await BlogPostModel.deleteMany({});
    await ContactRequestModel.deleteMany({});
  });

  beforeEach(async () => {
    await RedirectModel.deleteMany({});
    await AuditLogModel.deleteMany({});
    await ServiceModel.deleteMany({});
    await BlogPostModel.deleteMany({});
    await ContactRequestModel.deleteMany({});
  });

  describe('SEO & Sitemap Data', () => {
    it('generates bilingual sitemap entries with alternates for static and catalog resources', async () => {
      await ServiceModel.create({
        name: { vi: 'Phát triển phần mềm', en: 'Software Development' },
        slug: { vi: 'phat-trien-phan-mem', en: 'software-development' },
        status: 'published',
      });

      const sitemap = await seoService.getSitemapData();
      expect(sitemap.length).toBeGreaterThan(10); // Static pages + service

      // Verify static route alternates
      const homeVi = sitemap.find(e => e.loc.endsWith('/') && e.locale === 'vi');
      expect(homeVi).toBeDefined();
      expect(homeVi.alternates).toHaveLength(2);

      const homeEn = sitemap.find(e => e.loc.endsWith('/en') && e.locale === 'en');
      expect(homeEn).toBeDefined();

      // Verify published service in sitemap
      const serviceVi = sitemap.find(e => e.loc.includes('/services/phat-trien-phan-mem'));
      expect(serviceVi).toBeDefined();
      expect(serviceVi.locale).toBe('vi');
    });

    it('resolves redirects with status code', async () => {
      await redirectService.createRedirect({
        from: '/cu-duong-dan',
        to: '/moi-duong-dan',
        statusCode: 301,
      });

      const resolved = await seoService.resolveRedirect('/cu-duong-dan');
      expect(resolved).toBeDefined();
      expect(resolved.to).toBe('/moi-duong-dan');
      expect(resolved.statusCode).toBe(301);

      const missing = await seoService.resolveRedirect('/khong-ton-tai');
      expect(missing).toBeNull();
    });
  });

  describe('Redirects Admin Management', () => {
    it('manages redirects with chain flattening and loop prevention', async () => {
      // 1. Create redirect A -> B
      await redirectService.createRedirect({ from: '/page-a', to: '/page-b' });

      // 2. Create redirect B -> C (should flatten A -> C)
      await redirectService.createRedirect({ from: '/page-b', to: '/page-c' });

      const updatedA = await RedirectModel.findOne({ from: '/page-a' });
      expect(updatedA.to).toBe('/page-c');

      // 3. Prevent loop: attempting C -> A should be rejected
      await expect(
        redirectService.createRedirect({ from: '/page-c', to: '/page-a' }),
      ).rejects.toThrow();

      // 4. List redirects
      const list = await redirectService.listRedirects({ search: 'page' });
      expect(list.data).toHaveLength(2);

      // 5. Delete redirect
      await redirectService.deleteRedirect(updatedA._id.toString());
      const deletedA = await RedirectModel.findById(updatedA._id);
      expect(deletedA).toBeNull();
    });
  });

  describe('Audit Logs Admin', () => {
    it('records and queries audit logs with filters and pagination', async () => {
      await audit.record({
        action: 'test.create',
        resource: { type: 'test_resource', id: '123', label: 'Item 123' },
        changes: { field: 'value' },
      });

      await audit.record({
        action: 'user.login',
        resource: { type: 'auth', id: null, label: 'Login' },
      });

      const list = await auditLogService.listAuditLogs({ action: 'test' });
      expect(list.data).toHaveLength(1);
      expect(list.data[0].action).toBe('test.create');
      expect(list.data[0].resource.type).toBe('test_resource');

      const byId = await auditLogService.getAuditLogById(list.data[0]._id.toString());
      expect(byId._id.toString()).toBe(list.data[0]._id.toString());
    });
  });

  describe('Dashboard Summary', () => {
    it('aggregates collection counts, new contacts, drafts, and recent activity', async () => {
      // 1. Create published and draft services
      await ServiceModel.create([
        {
          name: { vi: 'Dịch vụ 1', en: 'Service 1' },
          slug: { vi: 'dich-vu-1', en: 'service-1' },
          status: 'published',
        },
        {
          name: { vi: 'Dịch vụ 2', en: 'Service 2' },
          slug: { vi: 'dich-vu-2', en: 'service-2' },
          status: 'draft',
        },
      ]);

      // 2. Create contact requests (1 new, 1 in_review)
      await ContactRequestModel.create([
        {
          name: 'Lead 1',
          email: 'lead1@test.com',
          message: 'Interested in software architecture.',
          status: 'new',
        },
        {
          name: 'Lead 2',
          email: 'lead2@test.com',
          message: 'Need cloud migration.',
          status: 'in_review',
        },
      ]);

      // 3. Create scheduled blog post
      const future = new Date(Date.now() + 86400 * 1000);
      await BlogPostModel.create({
        title: { vi: 'Bài tương lai', en: 'Future Post' },
        slug: { vi: 'bai-tuong-lai-dash', en: 'future-post-dash' },
        status: 'published',
        publishedAt: future,
      });

      // 4. Create an audit log
      await audit.record({
        action: 'dashboard.test',
        resource: { type: 'test', id: '1' },
      });

      const summary = await dashboardService.getSummary();
      expect(summary.counts.services.total).toBe(2);
      expect(summary.counts.services.published).toBe(1);
      expect(summary.counts.services.draft).toBe(1);
      expect(summary.newContactRequests).toBe(1);
      expect(summary.recentContactRequests).toHaveLength(2);
      expect(summary.scheduled).toHaveLength(1);
      expect(summary.scheduled[0].title.vi).toBe('Bài tương lai');
      expect(summary.recentActivity.length).toBeGreaterThan(0);
    });
  });
});
