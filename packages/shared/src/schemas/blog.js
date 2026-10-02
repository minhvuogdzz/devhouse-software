import { z } from 'zod';
import {
  LocalizedStringSchema,
  LocalizedSlugSchema,
  ImageRefSchema,
  SeoMetadataSchema,
} from './common.js';

export const AuthorSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  slug: z.string().min(1, 'Author slug is required'),
  role: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  bio: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  avatar: ImageRefSchema.optional().default({ publicId: '', url: '' }),
});

export const TagSchema = z.object({
  name: LocalizedStringSchema,
  slug: LocalizedSlugSchema,
});

export const BlogPostSchema = z.object({
  title: LocalizedStringSchema,
  slug: LocalizedSlugSchema,
  excerpt: LocalizedStringSchema,
  content: z.object({
    vi: z.any().optional().default({ type: 'doc', content: [] }),
    en: z.any().optional().default({ type: 'doc', content: [] }),
  }),
  contentText: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  readingTimeMinutes: z
    .object({
      vi: z.number().int().default(1),
      en: z.number().int().default(1),
    })
    .optional()
    .default({ vi: 1, en: 1 }),
  author: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  featuredImage: ImageRefSchema.optional().default({ publicId: '', url: '' }),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.coerce.date().optional().nullable(),
  seo: SeoMetadataSchema.optional().default({}),
});
