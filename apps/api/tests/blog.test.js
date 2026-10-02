import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { BlogPostModel } from '../src/modules/blog/post.model.js';
import { AuthorModel } from '../src/modules/blog/author.model.js';
import { TagModel } from '../src/modules/blog/tag.model.js';
import {
  blogService,
  extractPlainText,
  calculateReadingTime,
  deriveExcerpt,
} from '../src/modules/blog/blog.service.js';
import { RedirectModel } from '../src/modules/redirects/redirect.model.js';

describe('Blog Module', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhouse_dev';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await BlogPostModel.deleteMany({});
    await AuthorModel.deleteMany({});
    await TagModel.deleteMany({});
    await RedirectModel.deleteMany({});
  });

  beforeEach(async () => {
    await BlogPostModel.deleteMany({});
    await AuthorModel.deleteMany({});
    await TagModel.deleteMany({});
    await RedirectModel.deleteMany({});
  });

  describe('Rich text derivation & reading time', () => {
    it('extracts plain text from nested rich text document', () => {
      const richDoc = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'text', text: 'world of software.' },
            ],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Building enterprise software.' }],
          },
        ],
      };

      const plain = extractPlainText(richDoc);
      expect(plain).toContain('Hello');
      expect(plain).toContain('world of software.');
      expect(plain).toContain('Building enterprise software.');
    });

    it('calculates reading time (200 words per minute, min 1)', () => {
      expect(calculateReadingTime('')).toBe(1);
      const shortText = 'One two three four five';
      expect(calculateReadingTime(shortText)).toBe(1);

      const words250 = new Array(250).fill('word').join(' ');
      expect(calculateReadingTime(words250)).toBe(2);

      const words450 = new Array(450).fill('word').join(' ');
      expect(calculateReadingTime(words450)).toBe(3);
    });

    it('derives excerpt accurately up to max chars', () => {
      const text = 'Dev House Software is a reliable engineering partner.';
      expect(deriveExcerpt(text, 20)).toBe('Dev House Software...');
      expect(deriveExcerpt(text, 100)).toBe(text);
    });
  });

  describe('Post creation with auto-processing', () => {
    it('computes contentText, readingTime, and excerpt on create', async () => {
      const author = await AuthorModel.create({
        name: 'Nguyen Van A',
        slug: 'nguyen-van-a',
        role: { vi: 'Kỹ sư trưởng', en: 'Lead Engineer' },
      });

      const words = new Array(210).fill('chuyên-nghiệp').join(' ');
      const post = await blogService.createAdminPost(
        {
          title: { vi: 'Bài viết công nghệ', en: 'Technology Article' },
          content: {
            vi: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: words }],
                },
              ],
            },
            en: {
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Short English content.' }],
                },
              ],
            },
          },
          author: author._id.toString(),
          status: 'published',
          publishedAt: new Date(),
        },
        true,
        { id: 'admin1', role: 'admin' },
      );

      expect(post.contentText.vi).toContain('chuyên-nghiệp');
      expect(post.readingTimeMinutes.vi).toBe(2);
      expect(post.readingTimeMinutes.en).toBe(1);
      expect(post.excerpt.vi.length).toBeGreaterThan(0);
      expect(post.excerpt.en).toBe('Short English content.');
    });
  });

  describe('Public listing and published filter', () => {
    it('excludes drafts and future scheduled posts from public query', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 3600 * 1000);
      const future = new Date(now.getTime() + 86400 * 1000);

      // Published post in past
      await BlogPostModel.create({
        title: { vi: 'Bài đã xuất bản', en: 'Published Post' },
        slug: { vi: 'bai-da-xuat-ban', en: 'published-post' },
        status: 'published',
        publishedAt: past,
      });

      // Draft post
      await BlogPostModel.create({
        title: { vi: 'Bài nháp', en: 'Draft Post' },
        slug: { vi: 'bai-nhap', en: 'draft-post' },
        status: 'draft',
      });

      // Future scheduled post
      await BlogPostModel.create({
        title: { vi: 'Bài tương lai', en: 'Future Post' },
        slug: { vi: 'bai-tuong-lai', en: 'future-post' },
        status: 'published',
        publishedAt: future,
      });

      const resVi = await blogService.listPublicPosts({ locale: 'vi' });
      expect(resVi.data).toHaveLength(1);
      expect(resVi.data[0].title).toBe('Bài đã xuất bản');
      expect(resVi.data[0].alternates).toBeDefined();

      const resEn = await blogService.listPublicPosts({ locale: 'en' });
      expect(resEn.data).toHaveLength(1);
      expect(resEn.data[0].title).toBe('Published Post');
    });

    it('returns public post by slug with alternates and related posts', async () => {
      const tag = await TagModel.create({
        name: { vi: 'Kiến trúc', en: 'Architecture' },
        slug: { vi: 'kien-truc', en: 'architecture' },
      });

      await BlogPostModel.create({
        title: { vi: 'Bài viết 1', en: 'Post 1' },
        slug: { vi: 'bai-viet-1', en: 'post-1' },
        status: 'published',
        publishedAt: new Date(Date.now() - 10000),
        tags: [tag._id],
      });

      await BlogPostModel.create({
        title: { vi: 'Bài viết 2 liên quan', en: 'Related Post 2' },
        slug: { vi: 'bai-viet-2-lien-quan', en: 'related-post-2' },
        status: 'published',
        publishedAt: new Date(Date.now() - 5000),
        tags: [tag._id],
      });

      const detail = await blogService.getPublicPostBySlug('bai-viet-1', 'vi');
      expect(detail.title).toBe('Bài viết 1');
      expect(detail.alternates.vi).toBe('/blog/bai-viet-1');
      expect(detail.alternates.en).toBe('/en/blog/post-1');
      expect(detail.related.length).toBeGreaterThanOrEqual(1);
      expect(detail.related[0].title).toBe('Bài viết 2 liên quan');
    });
  });

  describe('Tag post count and deletion cleanup', () => {
    it('calculates postCount per tag and removes tag from posts on tag delete', async () => {
      const tag = await TagModel.create({
        name: { vi: 'Công nghệ', en: 'Technology' },
        slug: { vi: 'cong-nghe', en: 'technology' },
      });

      const post = await BlogPostModel.create({
        title: { vi: 'Bài công nghệ', en: 'Tech Post' },
        slug: { vi: 'bai-cong-nghe', en: 'tech-post' },
        status: 'published',
        publishedAt: new Date(),
        tags: [tag._id],
      });

      const tagsWithCounts = await blogService.listPublicTags('vi');
      const found = tagsWithCounts.find(t => t.slug === 'cong-nghe');
      expect(found).toBeDefined();
      expect(found.postCount).toBe(1);

      // Deleting tag
      await blogService.deleteAdminTag(tag._id.toString());

      // Verify tag is removed from post
      const updatedPost = await BlogPostModel.findById(post._id);
      expect(updatedPost.tags).toHaveLength(0);
    });
  });

  describe('Author in-use guard', () => {
    it('prevents deleting an author that is referenced by posts', async () => {
      const author = await AuthorModel.create({
        name: 'Tran B',
        slug: 'tran-b',
      });

      await BlogPostModel.create({
        title: { vi: 'Bài của B', en: "B's Post" },
        slug: { vi: 'bai-cua-b', en: 'b-post' },
        status: 'draft',
        author: author._id,
      });

      await expect(blogService.deleteAdminAuthor(author._id.toString())).rejects.toThrow(
        /cannot be deleted/,
      );
    });

    it('allows deleting an author with no posts', async () => {
      const author = await AuthorModel.create({
        name: 'Le C',
        slug: 'le-c',
      });

      await expect(blogService.deleteAdminAuthor(author._id.toString())).resolves.toBeUndefined();
    });
  });

  describe('Slug changes and redirects', () => {
    it('creates automatic 301 redirects when post slugs are updated', async () => {
      const post = await BlogPostModel.create({
        title: { vi: 'Bài ban đầu', en: 'Initial Post' },
        slug: { vi: 'bai-ban-dau', en: 'initial-post' },
        status: 'published',
        publishedAt: new Date(),
      });

      await blogService.updateAdminPost(
        post._id.toString(),
        {
          slug: { vi: 'bai-cap-nhat', en: 'updated-post' },
        },
        { id: 'admin1', role: 'admin' },
      );

      const redirectVi = await RedirectModel.findOne({ from: '/blog/bai-ban-dau' });
      expect(redirectVi).toBeDefined();
      expect(redirectVi.to).toBe('/blog/bai-cap-nhat');

      const redirectEn = await RedirectModel.findOne({ from: '/en/blog/initial-post' });
      expect(redirectEn).toBeDefined();
      expect(redirectEn.to).toBe('/en/blog/updated-post');
    });
  });
});
