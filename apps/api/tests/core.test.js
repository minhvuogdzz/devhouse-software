import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { cache } from '../src/core/cache/index.js';
import { parseListQuery } from '../src/core/query/index.js';
import { AppError } from '../src/core/errors/index.js';

describe('API Core', () => {
  describe('Health Endpoints', () => {
    it('GET /api/v1/health/live returns 200 with status live', async () => {
      const res = await request(app).get('/api/v1/health/live');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'live' });
      expect(res.headers['x-request-id']).toBeDefined();
    });

    it('GET /unknown-route returns 404 in standard error envelope', async () => {
      const res = await request(app).get('/api/v1/non-existent-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.requestId).toBeDefined();
    });
  });

  describe('Query Builder', () => {
    it('parses pagination, sorting and bounds accurately', () => {
      const raw = { page: '2', limit: '25', sort: 'title', order: 'asc', status: 'published' };
      const parsed = parseListQuery(raw, {
        allowedSortFields: ['title', 'createdAt'],
        defaultSort: 'createdAt',
      });

      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(25);
      expect(parsed.skip).toBe(25);
      expect(parsed.sort).toEqual({ title: 1 });
      expect(parsed.filter.status).toBe('published');
    });

    it('clamps limit to maxLimit', () => {
      const raw = { limit: '500' };
      const parsed = parseListQuery(raw, { maxLimit: 50 });
      expect(parsed.limit).toBe(50);
    });
  });

  describe('In-Memory Cache & Tag Invalidation', () => {
    beforeEach(() => {
      cache.clear();
    });

    it('stores and retrieves cached values', () => {
      cache.set('key1', { hello: 'world' }, { ttlMs: 10000 });
      expect(cache.get('key1')).toEqual({ hello: 'world' });
    });

    it('invalidates entries by tag correctly', () => {
      cache.set('post:1', { id: 1 }, { tags: ['posts', 'blog'] });
      cache.set('post:2', { id: 2 }, { tags: ['posts'] });
      cache.set('service:1', { id: 1 }, { tags: ['services'] });

      expect(cache.get('post:1')).toBeDefined();
      expect(cache.get('post:2')).toBeDefined();

      cache.invalidateTag('posts');

      expect(cache.get('post:1')).toBeNull();
      expect(cache.get('post:2')).toBeNull();
      expect(cache.get('service:1')).toBeDefined();
    });
  });

  describe('AppError', () => {
    it('creates standard error instance with status and details', () => {
      const err = new AppError('TEST_ERROR', 'A test message', [{ field: 'x' }], 400);
      expect(err.code).toBe('TEST_ERROR');
      expect(err.status).toBe(400);
      expect(err.message).toBe('A test message');
      expect(err.details).toEqual([{ field: 'x' }]);
    });
  });

  describe('Environment Loader', () => {
    it('resolves rootEnvPath to the repository root .env', async () => {
      const { rootEnvPath } = await import('../src/config/index.js');
      expect(rootEnvPath).toBeDefined();
      expect(rootEnvPath.endsWith('.env')).toBe(true);
      // Path should NOT be inside apps/api — it should be 3 levels up
      expect(rootEnvPath).not.toContain('apps/api/src');
    });
  });
});
