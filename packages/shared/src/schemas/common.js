import { z } from 'zod';

export const LocalizedStringSchema = z.object({
  vi: z.string().default(''),
  en: z.string().default(''),
});

export const RequiredLocalizedStringSchema = z.object({
  vi: z.string().min(1, 'Vietnamese text is required'),
  en: z.string().min(1, 'English text is required'),
});

export const LocalizedSlugSchema = z.object({
  vi: z.string().min(1, 'Vietnamese slug is required'),
  en: z.string().min(1, 'English slug is required'),
});

export const ImageRefSchema = z.object({
  mediaId: z.string().optional(),
  publicId: z.string().default(''),
  url: z.string().default(''),
  width: z.number().optional(),
  height: z.number().optional(),
  format: z.string().optional(),
  alt: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
});

export const SeoMetadataSchema = z.object({
  title: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  description: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  keywords: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  ogImage: ImageRefSchema.optional(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  locale: z.enum(['vi', 'en']).optional().default('vi'),
});
