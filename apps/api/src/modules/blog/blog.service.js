import { BlogPostModel } from './post.model.js';
import { AuthorModel } from './author.model.js';
import { TagModel } from './tag.model.js';
import { CategoryModel } from '../categories/category.model.js';
import { cache } from '../../core/cache/index.js';
import { audit } from '../../core/audit/index.js';
import { redirectService } from '../redirects/redirect.service.js';
import { parseListQuery } from '../../core/query/index.js';
import { NotFoundError, ConflictError } from '../../core/errors/index.js';
import { localize } from '@devhouse/content';
import { buildAlternates } from '../catalog/catalog-resource.factory.js';

export function extractPlainText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;
  if (Array.isArray(node.content)) {
    return node.content.map(extractPlainText).join(' ');
  }
  return '';
}

export function calculateReadingTime(text) {
  if (!text) return 1;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function deriveExcerpt(text, maxChars = 200) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxChars) return clean;
  const truncated = clean.slice(0, maxChars);
  const lastSpace = truncated.lastIndexOf(' ');
  const slicePoint = lastSpace > 0 ? lastSpace : maxChars;
  return clean.slice(0, slicePoint).trim() + '...';
}

function processPostData(data) {
  const processed = { ...data };

  if (data.content) {
    processed.contentText = processed.contentText || {};
    processed.readingTimeMinutes = processed.readingTimeMinutes || {};
    processed.excerpt = processed.excerpt || {};

    if (data.content.vi) {
      const textVi = extractPlainText(data.content.vi);
      processed.contentText.vi = textVi;
      processed.readingTimeMinutes.vi = calculateReadingTime(textVi);
      if (!processed.excerpt.vi && textVi) {
        processed.excerpt.vi = deriveExcerpt(textVi);
      }
    }

    if (data.content.en) {
      const textEn = extractPlainText(data.content.en);
      processed.contentText.en = textEn;
      processed.readingTimeMinutes.en = calculateReadingTime(textEn);
      if (!processed.excerpt.en && textEn) {
        processed.excerpt.en = deriveExcerpt(textEn);
      }
    }
  }

  return processed;
}

export const blogService = {
  // Public
  async listPublicPosts(rawQuery) {
    const parsed = parseListQuery(rawQuery, {
      allowedSortFields: ['publishedAt', 'title'],
      defaultSort: 'publishedAt',
    });

    const filter = {
      isDeleted: false,
      status: 'published',
      publishedAt: { $lte: new Date() },
    };

    if (rawQuery.featured === 'true') {
      filter.isFeatured = true;
    }

    if (rawQuery.category) {
      const cat = await CategoryModel.findOne({
        type: 'post',
        $or: [{ 'slug.vi': rawQuery.category }, { 'slug.en': rawQuery.category }],
      });
      if (cat) filter.category = cat._id;
    }

    if (rawQuery.tag) {
      const tag = await TagModel.findOne({
        $or: [{ 'slug.vi': rawQuery.tag }, { 'slug.en': rawQuery.tag }],
      });
      if (tag) filter.tags = tag._id;
    }

    if (rawQuery.author) {
      const author = await AuthorModel.findOne({ slug: rawQuery.author });
      if (author) filter.author = author._id;
    }

    if (parsed.search) {
      filter.$or = [
        { 'title.vi': { $regex: parsed.search, $options: 'i' } },
        { 'title.en': { $regex: parsed.search, $options: 'i' } },
        { 'contentText.vi': { $regex: parsed.search, $options: 'i' } },
        { 'contentText.en': { $regex: parsed.search, $options: 'i' } },
      ];
    }

    const total = await BlogPostModel.countDocuments(filter);
    const docs = await BlogPostModel.find(filter)
      .select('-content -contentText')
      .sort(parsed.sort)
      .skip(parsed.skip)
      .limit(parsed.limit)
      .populate('author', 'name slug role avatar')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .lean();

    const locale = rawQuery.locale || 'vi';
    const transformed = docs.map(doc => {
      const localized = localize(doc, locale);
      localized.alternates = buildAlternates('/blog', doc.slug);
      return localized;
    });

    return {
      data: transformed,
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        totalPages: Math.ceil(total / parsed.limit),
        hasNext: parsed.page < Math.ceil(total / parsed.limit),
        hasPrev: parsed.page > 1,
      },
    };
  },

  async getPublicPostBySlug(slug, locale = 'vi') {
    const post = await BlogPostModel.findOne({
      isDeleted: false,
      status: 'published',
      publishedAt: { $lte: new Date() },
      $or: [{ 'slug.vi': slug }, { 'slug.en': slug }],
    })
      .populate('author', 'name slug role bio avatar links')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .lean();

    if (!post) {
      throw new NotFoundError('Blog post not found');
    }

    // Related posts (up to 3)
    const relatedFilter = {
      _id: { $ne: post._id },
      isDeleted: false,
      status: 'published',
      publishedAt: { $lte: new Date() },
    };
    if (post.category) relatedFilter.category = post.category._id || post.category;

    const related = await BlogPostModel.find(relatedFilter)
      .select('title slug excerpt coverImage publishedAt readingTimeMinutes')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    const localized = localize(post, locale);
    localized.related = related.map(r => {
      const item = localize(r, locale);
      item.alternates = buildAlternates('/blog', r.slug);
      return item;
    });
    localized.alternates = buildAlternates('/blog', post.slug);

    return localized;
  },

  async listPublicTags(locale = 'vi') {
    const cacheKey = `tags:public:${locale}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const tags = await TagModel.find().lean();
    const withCounts = await Promise.all(
      tags.map(async tag => {
        const count = await BlogPostModel.countDocuments({
          tags: tag._id,
          status: 'published',
          isDeleted: false,
          publishedAt: { $lte: new Date() },
        });
        const localized = localize(tag, locale);
        return {
          ...localized,
          postCount: count,
        };
      }),
    );

    cache.set(cacheKey, withCounts, { tags: ['tags', 'blog'], ttlMs: 60000 });
    return withCounts;
  },

  async getPublicAuthor(slug, locale = 'vi') {
    const author = await AuthorModel.findOne({ slug, isActive: true }).select('-user').lean();

    if (!author) {
      throw new NotFoundError('Author not found');
    }

    return localize(author, locale);
  },

  // Admin Posts
  async listAdminPosts(rawQuery) {
    const parsed = parseListQuery(rawQuery, {
      allowedSortFields: ['publishedAt', 'createdAt', 'title'],
      defaultSort: 'createdAt',
    });

    const filter = {};
    if (rawQuery.deleted === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = false;
    }

    if (rawQuery.status) {
      filter.status = rawQuery.status;
    }

    if (parsed.search) {
      filter.$or = [
        { 'title.vi': { $regex: parsed.search, $options: 'i' } },
        { 'title.en': { $regex: parsed.search, $options: 'i' } },
      ];
    }

    let countQuery = BlogPostModel.countDocuments(filter);
    let findQuery = BlogPostModel.find(filter)
      .select('-content -contentText')
      .sort(parsed.sort)
      .skip(parsed.skip)
      .limit(parsed.limit)
      .populate('author', 'name slug')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .lean();

    if (rawQuery.deleted === 'true') {
      countQuery = countQuery.setOptions({ withDeleted: true });
      findQuery = findQuery.setOptions({ withDeleted: true });
    }

    const [total, docs] = await Promise.all([countQuery, findQuery]);

    return {
      data: docs,
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        totalPages: Math.ceil(total / parsed.limit),
        hasNext: parsed.page < Math.ceil(total / parsed.limit),
        hasPrev: parsed.page > 1,
      },
    };
  },

  async getAdminPostById(id) {
    const post = await BlogPostModel.findById(id)
      .populate('author')
      .populate('category')
      .populate('tags');

    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return post;
  },

  async createAdminPost(data, hasPublishPermission, _actor) {
    const processed = processPostData(data);
    if (!hasPublishPermission) {
      processed.status = 'draft';
    }

    const post = await BlogPostModel.create(processed);
    cache.invalidateTag('blog');

    await audit.record({
      action: 'blog.create',
      resource: { type: 'blog_post', id: post._id.toString() },
      changes: processed,
    });

    return post;
  },

  async updateAdminPost(id, data, _actor) {
    const existing = await BlogPostModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Post not found');
    }

    const processed = processPostData(data);

    // Slug redirect check
    if (processed.slug) {
      if (existing.slug?.vi && processed.slug.vi && existing.slug.vi !== processed.slug.vi) {
        await redirectService.createAutoRedirect(
          `/blog/${existing.slug.vi}`,
          `/blog/${processed.slug.vi}`,
        );
      }
      if (existing.slug?.en && processed.slug.en && existing.slug.en !== processed.slug.en) {
        await redirectService.createAutoRedirect(
          `/en/blog/${existing.slug.en}`,
          `/en/blog/${processed.slug.en}`,
        );
      }
    }

    Object.assign(existing, processed);
    await existing.save();
    cache.invalidateTag('blog');

    await audit.record({
      action: 'blog.update',
      resource: { type: 'blog_post', id: existing._id.toString() },
      changes: processed,
    });

    return existing;
  },

  async updateAdminPostStatus(id, { status, publishedAt }, _actor) {
    const existing = await BlogPostModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Post not found');
    }

    existing.status = status;
    if (publishedAt !== undefined) {
      existing.publishedAt = publishedAt;
    } else if (status === 'published' && !existing.publishedAt) {
      existing.publishedAt = new Date();
    }

    await existing.save();
    cache.invalidateTag('blog');

    await audit.record({
      action: 'blog.status',
      resource: { type: 'blog_post', id: existing._id.toString() },
      changes: { status, publishedAt: existing.publishedAt },
    });

    return existing;
  },

  async softDeleteAdminPost(id, callerId) {
    const existing = await BlogPostModel.findById(id);
    if (!existing) {
      throw new NotFoundError('Post not found');
    }

    await existing.softDelete(callerId);
    cache.invalidateTag('blog');

    await audit.record({
      action: 'blog.delete',
      resource: { type: 'blog_post', id: existing._id.toString() },
    });
  },

  async restoreAdminPost(id) {
    const existing = await BlogPostModel.findOne({ _id: id, isDeleted: true }).setOptions({
      withDeleted: true,
    });
    if (!existing) {
      throw new NotFoundError('Post not found or not deleted');
    }

    await existing.restore();
    cache.invalidateTag('blog');

    await audit.record({
      action: 'blog.restore',
      resource: { type: 'blog_post', id: existing._id.toString() },
    });

    return existing;
  },

  // Admin Authors
  async listAdminAuthors() {
    return AuthorModel.find().lean();
  },

  async createAdminAuthor(data) {
    const author = await AuthorModel.create(data);
    await audit.record({
      action: 'author.create',
      resource: { type: 'author', id: author._id.toString() },
      changes: data,
    });
    return author;
  },

  async updateAdminAuthor(id, data) {
    const author = await AuthorModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!author) throw new NotFoundError('Author not found');
    await audit.record({
      action: 'author.update',
      resource: { type: 'author', id: author._id.toString() },
      changes: data,
    });
    return author;
  },

  async deleteAdminAuthor(id) {
    const postCount = await BlogPostModel.countDocuments({ author: id, isDeleted: false });
    if (postCount > 0) {
      throw new ConflictError(
        `Author is associated with ${postCount} posts and cannot be deleted`,
        'RESOURCE_IN_USE',
      );
    }
    await AuthorModel.findByIdAndDelete(id);
    await audit.record({
      action: 'author.delete',
      resource: { type: 'author', id: id.toString() },
    });
  },

  // Admin Tags
  async listAdminTags() {
    const tags = await TagModel.find().lean();
    return Promise.all(
      tags.map(async t => {
        const count = await BlogPostModel.countDocuments({ tags: t._id, isDeleted: false });
        return { ...t, postCount: count };
      }),
    );
  },

  async createAdminTag(data) {
    const tag = await TagModel.create(data);
    cache.invalidateTag('tags');
    await audit.record({
      action: 'tag.create',
      resource: { type: 'tag', id: tag._id.toString() },
      changes: data,
    });
    return tag;
  },

  async updateAdminTag(id, data) {
    const tag = await TagModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!tag) throw new NotFoundError('Tag not found');
    cache.invalidateTag('tags');
    await audit.record({
      action: 'tag.update',
      resource: { type: 'tag', id: tag._id.toString() },
      changes: data,
    });
    return tag;
  },

  async deleteAdminTag(id) {
    await BlogPostModel.updateMany({ tags: id }, { $pull: { tags: id } });
    await TagModel.findByIdAndDelete(id);
    cache.invalidateTag('tags');
    await audit.record({
      action: 'tag.delete',
      resource: { type: 'tag', id: id.toString() },
    });
  },
};
