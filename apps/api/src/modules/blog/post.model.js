import mongoose from 'mongoose';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';
import { localizedPlugin } from '../../core/db/plugins/localized.js';
import { sluggablePlugin } from '../../core/db/plugins/sluggable.js';

const imageRefSchema = new mongoose.Schema(
  {
    publicId: { type: String, default: '' },
    url: { type: String, default: '' },
    width: { type: Number },
    height: { type: Number },
    alt: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
  },
  { _id: false },
);

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      vi: { type: String, required: true },
      en: { type: String, default: '' },
    },
    excerpt: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    content: {
      vi: { type: mongoose.Schema.Types.Mixed, default: { type: 'doc', content: [] } },
      en: { type: mongoose.Schema.Types.Mixed, default: { type: 'doc', content: [] } },
    },
    contentVersion: {
      type: Number,
      default: 1,
    },
    contentText: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    readingTimeMinutes: {
      vi: { type: Number, default: 1 },
      en: { type: Number, default: 1 },
    },
    coverImage: {
      type: imageRefSchema,
      default: () => ({}),
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Author',
      default: null,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    seo: {
      title: {
        vi: { type: String, default: '' },
        en: { type: String, default: '' },
      },
      description: {
        vi: { type: String, default: '' },
        en: { type: String, default: '' },
      },
      canonicalUrl: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  },
);

blogPostSchema.plugin(sluggablePlugin, { source: 'title', localized: true });
blogPostSchema.plugin(publishablePlugin);
blogPostSchema.plugin(softDeletePlugin);
blogPostSchema.plugin(auditablePlugin);
blogPostSchema.plugin(localizedPlugin, { requiredFields: ['title'] });

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index(
  { 'slug.vi': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
blogPostSchema.index(
  { 'slug.en': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
blogPostSchema.index({ category: 1, status: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1, publishedAt: -1 });
blogPostSchema.index({ author: 1, publishedAt: -1 });

export const BlogPostModel =
  mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema, 'blog_posts');
