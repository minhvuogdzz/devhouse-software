import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { searchService } from '../src/modules/search/search.service.js';
import { ServiceModel } from '../src/modules/services/service.model.js';
import { PackageModel } from '../src/modules/packages/package.model.js';

describe('Search and DH AI Module', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhouse_dev';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    await ServiceModel.create({
      name: { vi: 'Thiết kế website doanh nghiệp', en: 'Corporate Website Design' },
      shortDescription: {
        vi: 'Xây dựng website chuẩn SEO, tốc độ cao cho doanh nghiệp.',
        en: 'SEO-ready, high-speed website for enterprises.',
      },
      status: 'published',
      isDeleted: false,
    });

    await PackageModel.create({
      name: { vi: 'Gói Cơ bản', en: 'Basic Package' },
      shortDescription: {
        vi: 'Phù hợp cho cửa hàng và cá nhân khởi nghiệp.',
        en: 'Perfect for retail shops and startups.',
      },
      status: 'published',
      isDeleted: false,
    });
  });

  afterAll(async () => {
    await ServiceModel.deleteMany({ 'name.vi': 'Thiết kế website doanh nghiệp' });
    await PackageModel.deleteMany({ 'name.vi': 'Gói Cơ bản' });
  });

  it('performs universal search across database and static pages', async () => {
    const result = await searchService.universalSearch({ q: 'website', locale: 'vi' });
    expect(result.query).toBe('website');
    expect(result.items.length).toBeGreaterThan(0);

    const hasService = result.items.some(i => i.type === 'service');
    expect(hasService).toBe(true);
  });

  it('matches static page registry entries', async () => {
    const result = await searchService.universalSearch({ q: 'Liên hệ', locale: 'vi' });
    const hasContact = result.items.some(i => i.id === 'page-contact');
    expect(hasContact).toBe(true);
  });

  it('handles empty query gracefully', async () => {
    const result = await searchService.universalSearch({ q: '', locale: 'vi' });
    expect(result.total).toBe(0);
    expect(result.items).toEqual([]);
  });

  it('DH AI responds gracefully even when no secret key is set', async () => {
    const result = await searchService.aiSearch({ q: 'Tư vấn báo giá website', locale: 'vi' });
    expect(result.mode).toBe('ai');
    expect(result.answer).toContain('DH AI');
    expect(Array.isArray(result.relatedResults)).toBe(true);
  });
});
