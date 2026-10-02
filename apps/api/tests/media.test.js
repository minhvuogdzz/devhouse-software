import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MediaModel } from '../src/modules/media/media.model.js';
import { mediaService } from '../src/modules/media/media.service.js';
import { ProjectModel } from '../src/modules/projects/project.model.js';
import { config } from '../src/config/index.js';
import { ERROR_CODES } from '@devhouse/shared';

describe('Media Module (M8)', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhouse_dev';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await MediaModel.deleteMany({});
    await ProjectModel.deleteMany({});
  });

  beforeEach(async () => {
    await MediaModel.deleteMany({});
    await ProjectModel.deleteMany({});
  });

  describe('Cloudinary Configuration & Signature Generation', () => {
    it('returns 503 MEDIA_NOT_CONFIGURED when Cloudinary credentials are missing', () => {
      const origName = config.CLOUDINARY_CLOUD_NAME;
      config.CLOUDINARY_CLOUD_NAME = '';

      expect(() => {
        mediaService.getUploadSignature({ folder: 'projects' });
      }).toThrowError();

      try {
        mediaService.getUploadSignature({ folder: 'projects' });
      } catch (err) {
        expect(err.code).toBe(ERROR_CODES.MEDIA_NOT_CONFIGURED);
        expect(err.status).toBe(503);
      }

      config.CLOUDINARY_CLOUD_NAME = origName;
    });

    it('generates a valid signed upload payload when configured', () => {
      config.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
      config.CLOUDINARY_API_KEY = '1234567890';
      config.CLOUDINARY_API_SECRET = 'secretkey123';

      const sigData = mediaService.getUploadSignature({
        folder: 'projects',
        resourceType: 'image',
        filename: 'Hero Image Banner.png',
      });

      expect(sigData.cloudName).toBe('demo-cloud');
      expect(sigData.apiKey).toBe('1234567890');
      expect(sigData.timestamp).toBeDefined();
      expect(sigData.signature).toBeDefined();
      expect(sigData.params.folder).toBe('devhouse/dev/projects');
      expect(sigData.params.public_id).toContain('hero-image-banner');
      expect(sigData.params.overwrite).toBe(false);
    });
  });

  describe('Media Registration & Management', () => {
    it('registers uploaded asset and prevents duplicate registration', async () => {
      const mediaData = {
        publicId: 'devhouse/dev/projects/hero-image-banner-abcd',
        resourceType: 'image',
        format: 'png',
        bytes: 102400,
        width: 1920,
        height: 1080,
        url: 'https://res.cloudinary.com/demo/image/upload/v1/devhouse/dev/projects/hero-image-banner-abcd.png',
        originalFilename: 'Hero Image Banner.png',
        title: 'Project Hero Banner',
        folder: 'projects',
        alt: { vi: 'Ảnh bìa dự án', en: 'Project cover image' },
      };

      const media = await mediaService.registerMedia(mediaData, '507f1f77bcf86cd799439011');
      expect(media._id).toBeDefined();
      expect(media.publicId).toBe(mediaData.publicId);
      expect(media.width).toBe(1920);
      expect(media.isDeleted).toBe(false);

      // Attempt duplicate registration
      await expect(
        mediaService.registerMedia(mediaData, '507f1f77bcf86cd799439011'),
      ).rejects.toThrow();
    });

    it('updates media metadata', async () => {
      const media = await MediaModel.create({
        publicId: 'devhouse/dev/site/logo-1234',
        resourceType: 'image',
        bytes: 4096,
        folder: 'site',
        title: 'Old Logo',
        alt: { vi: 'Logo cũ', en: 'Old Logo' },
      });

      const updated = await mediaService.updateMedia(
        media._id.toString(),
        {
          title: 'Brand Logo',
          alt: { vi: 'Logo thương hiệu', en: 'Brand Logo' },
          tags: ['branding', 'logo'],
        },
        '507f1f77bcf86cd799439011',
      );

      expect(updated.title).toBe('Brand Logo');
      expect(updated.tags).toContain('branding');
    });

    it('lists media with search and folder filters', async () => {
      await MediaModel.create([
        {
          publicId: 'devhouse/dev/blog/post1',
          resourceType: 'image',
          bytes: 5000,
          folder: 'blog',
          title: 'Blog Post Cover',
          tags: ['blog'],
        },
        {
          publicId: 'devhouse/dev/services/service1',
          resourceType: 'image',
          bytes: 12000,
          folder: 'services',
          title: 'Cloud Service Architecture',
          tags: ['architecture'],
        },
      ]);

      const blogList = await mediaService.listMedia({ folder: 'blog' });
      expect(blogList.data).toHaveLength(1);
      expect(blogList.data[0].publicId).toBe('devhouse/dev/blog/post1');

      const searchList = await mediaService.listMedia({ search: 'Architecture' });
      expect(searchList.data).toHaveLength(1);
      expect(searchList.data[0].publicId).toBe('devhouse/dev/services/service1');
    });
  });

  describe('Media Usage & In-Use Guard on Deletion', () => {
    it('detects usage and blocks deletion without force flag', async () => {
      const media = await MediaModel.create({
        publicId: 'devhouse/dev/projects/cover-1',
        resourceType: 'image',
        bytes: 20480,
        folder: 'projects',
        alt: { vi: 'Ảnh dự án', en: 'Project Image' },
      });

      // Reference media in a project
      await ProjectModel.create({
        title: { vi: 'Hệ thống ERP', en: 'ERP System' },
        slug: { vi: 'he-thong-erp', en: 'erp-system' },
        coverImage: {
          mediaId: media._id.toString(),
          publicId: media.publicId,
          alt: { vi: 'ERP Cover', en: 'ERP Cover' },
        },
        status: 'published',
      });

      // Verify usage lookup
      const usages = await mediaService.getMediaUsage(media._id.toString());
      expect(usages.length).toBeGreaterThan(0);
      expect(usages[0].resourceType).toBe('project');
      expect(usages[0].label).toBe('Hệ thống ERP');

      // Attempt to delete without force
      await expect(
        mediaService.deleteMedia(
          media._id.toString(),
          { force: false },
          '507f1f77bcf86cd799439011',
        ),
      ).rejects.toThrow(/in use/);

      // Delete with force
      await expect(
        mediaService.deleteMedia(media._id.toString(), { force: true }, '507f1f77bcf86cd799439011'),
      ).resolves.toBeUndefined();

      const deletedMedia = await MediaModel.findById(media._id);
      expect(deletedMedia).toBeNull(); // Default query filters out soft-deleted
      const withDeleted = await MediaModel.findOne({ _id: media._id }).setOptions({
        withDeleted: true,
      });
      expect(withDeleted.isDeleted).toBe(true);
    });
  });

  describe('ImageRef Snapshot Generation', () => {
    it('creates an authoritative ImageRef snapshot from a media record', async () => {
      const media = await MediaModel.create({
        publicId: 'devhouse/dev/site/hero-main',
        resourceType: 'image',
        format: 'webp',
        width: 1440,
        height: 900,
        bytes: 65400,
        url: 'https://res.cloudinary.com/demo/image/upload/hero-main.webp',
        alt: { vi: 'Ảnh giới thiệu', en: 'Hero illustration' },
      });

      const snapshot = await mediaService.createImageRefSnapshot(media._id.toString());
      expect(snapshot.mediaId).toBe(media._id.toString());
      expect(snapshot.publicId).toBe('devhouse/dev/site/hero-main');
      expect(snapshot.width).toBe(1440);
      expect(snapshot.height).toBe(900);
      expect(snapshot.format).toBe('webp');
      expect(snapshot.alt.vi).toBe('Ảnh giới thiệu');
    });
  });
});
