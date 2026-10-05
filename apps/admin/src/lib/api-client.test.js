import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiClient } from './api-client.js';

const respond = body =>
  vi.fn().mockResolvedValue({
    ok: true,
    headers: { get: () => 'application/json' },
    json: async () => body,
  });

afterEach(() => vi.unstubAllGlobals());

describe('admin apiClient', () => {
  it('puts the paging details of a list where the screens read them', async () => {
    const pagination = { page: 2, limit: 10, total: 25, totalPages: 3 };
    vi.stubGlobal('fetch', respond({ success: true, data: [{ _id: 1 }], meta: { pagination } }));
    const res = await apiClient('/admin/products?page=2');
    expect(res.data).toEqual([{ _id: 1 }]);
    expect(res.pagination).toEqual(pagination);
  });

  it('leaves responses without paging alone', async () => {
    vi.stubGlobal('fetch', respond({ success: true, data: { ok: true }, meta: {} }));
    const res = await apiClient('/admin/settings');
    expect(res.pagination).toBeUndefined();
  });
});
