import { z } from 'zod';
import { isEmbeddableDemoUrl } from '../utils/url.js';
import { LocalizedStringSchema, LocalizedSlugSchema, SeoMetadataSchema } from './common.js';

export const CategorySchema = z.object({
  type: z.enum([
    'service',
    'solution',
    'project',
    'project-segment',
    'technology',
    'product',
    'product-segment',
  ]),
  name: LocalizedStringSchema,
  slug: LocalizedSlugSchema,
  description: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  order: z.number().int().default(0),
});

export const TechnologySchema = z.object({
  name: z.string().min(1, 'Technology name is required'),
  slug: z.string().min(1, 'Technology slug is required'),
  category: z.string().optional().nullable(),
  description: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  icon: z.string().optional().default(''),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
});

export const SolutionSchema = z.object({
  name: LocalizedStringSchema,
  slug: LocalizedSlugSchema,
  shortDescription: LocalizedStringSchema,
  description: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  targetAudience: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  order: z.number().int().default(0),
  services: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.coerce.date().optional().nullable(),
  seo: SeoMetadataSchema.optional().default({}),
});

const ObjectIdString = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

/** Vietnamese is required, English is optional (the item then only appears in Vietnamese). */
const LocalizedRequiredViSchema = z.object({
  vi: z.string().trim().min(1, 'Vietnamese text is required'),
  en: z.string().default(''),
});

const OptionalLocalizedSlugSchema = z
  .object({ vi: z.string().default(''), en: z.string().default('') })
  .optional();

export const ProductThumbnailSchema = z.object({
  mediaId: z.string().optional(),
  publicId: z.string().default(''),
  url: z.string().min(1, 'Image url is required'),
  width: z.number().optional(),
  height: z.number().optional(),
  alt: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
});

/**
 * Website template / product shown as a card (admin: "Mẫu website").
 * Up to 3 thumbnails rotate on the card; the demo opens inside the site.
 */
export const ProductSchema = z.object({
  name: LocalizedRequiredViSchema,
  slug: OptionalLocalizedSlugSchema,
  shortDescription: LocalizedStringSchema.default({ vi: '', en: '' }),
  description: LocalizedStringSchema.default({ vi: '', en: '' }),
  thumbnails: z.array(ProductThumbnailSchema).max(3, 'At most 3 thumbnails').default([]),
  segment: ObjectIdString.nullable().default(null),
  category: ObjectIdString.nullable().default(null),
  rating: z.number().min(0, 'Rating is 0 to 5').max(5, 'Rating is 0 to 5').default(0),
  views: z.number().int().min(0).default(0),
  demoUrl: z
    .string()
    .trim()
    .refine(value => value === '' || isEmbeddableDemoUrl(value), {
      message: 'Demo link must start with https://',
    })
    .default(''),
  isFeatured: z.boolean().default(false),
  order: z.number().int().default(0),
  packages: z.array(ObjectIdString).default([]),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  seo: SeoMetadataSchema.optional(),
  updatedAt: z.string().optional(),
});

export const ProductUpdateSchema = ProductSchema.partial();

/**
 * Project (admin: "Dự án"). It is set up like a website template (card pictures, area, type,
 * rating, views, demo link) and may also carry an optional case study (client, challenge,
 * solution, results).
 */
export const ProjectSchema = z.object({
  title: LocalizedRequiredViSchema,
  slug: OptionalLocalizedSlugSchema,
  shortDescription: LocalizedStringSchema.default({ vi: '', en: '' }),
  description: LocalizedStringSchema.default({ vi: '', en: '' }),
  thumbnails: z.array(ProductThumbnailSchema).max(3, 'At most 3 thumbnails').default([]),
  segment: ObjectIdString.nullable().default(null),
  category: ObjectIdString.nullable().default(null),
  rating: z.number().min(0, 'Rating is 0 to 5').max(5, 'Rating is 0 to 5').default(0),
  views: z.number().int().min(0).default(0),
  demoUrl: z
    .string()
    .trim()
    .refine(value => value === '' || isEmbeddableDemoUrl(value), {
      message: 'Demo link must start with https://',
    })
    .default(''),
  client: z
    .object({
      name: z.string().default(''),
      industry: LocalizedStringSchema.default({ vi: '', en: '' }),
      country: z.string().default(''),
      isConfidential: z.boolean().default(false),
    })
    .default({}),
  challenge: LocalizedStringSchema.default({ vi: '', en: '' }),
  solution: LocalizedStringSchema.default({ vi: '', en: '' }),
  results: z
    .array(
      z.object({
        label: LocalizedStringSchema.default({ vi: '', en: '' }),
        value: LocalizedStringSchema.default({ vi: '', en: '' }),
        description: LocalizedStringSchema.default({ vi: '', en: '' }),
      }),
    )
    .max(12)
    .default([]),
  services: z.array(ObjectIdString).default([]),
  technologies: z.array(ObjectIdString).default([]),
  isFeatured: z.boolean().default(false),
  order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  seo: SeoMetadataSchema.optional(),
  updatedAt: z.string().optional(),
});

export const ProjectUpdateSchema = ProjectSchema.partial();

const MoneySchema = z.number().min(0).nullable();

/** A sellable package: one-time setup fee plus a recurring fee. Prices stay empty until decided. */
export const PackageSchema = z.object({
  name: LocalizedRequiredViSchema,
  slug: OptionalLocalizedSlugSchema,
  audience: LocalizedStringSchema.default({ vi: '', en: '' }),
  shortDescription: LocalizedStringSchema.default({ vi: '', en: '' }),
  inclusions: z
    .array(z.object({ text: LocalizedStringSchema }))
    .max(30)
    .default([]),
  supportHours: LocalizedStringSchema.default({ vi: '', en: '' }),
  setupFee: MoneySchema.default(null),
  recurringFee: MoneySchema.default(null),
  recurringPeriod: z.enum(['quarter', 'year']).default('year'),
  currency: z.enum(['VND', 'USD', 'EUR']).default('VND'),
  priceNote: LocalizedStringSchema.default({ vi: '', en: '' }),
  isFeatured: z.boolean().default(false),
  order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  seo: SeoMetadataSchema.optional(),
  updatedAt: z.string().optional(),
});

export const PackageUpdateSchema = PackageSchema.partial();

/**
 * One of the service groups on the site (website design, cloud, domain, support).
 * Prices live in packages, not here.
 */
export const ServiceSchema = z.object({
  name: LocalizedRequiredViSchema,
  slug: OptionalLocalizedSlugSchema,
  shortDescription: LocalizedStringSchema.default({ vi: '', en: '' }),
  description: LocalizedStringSchema.default({ vi: '', en: '' }),
  icon: z.string().max(40).default(''),
  image: ProductThumbnailSchema.nullable().default(null),
  billing: z.enum(['one_time', 'recurring', 'yearly']).default('recurring'),
  features: z
    .array(z.object({ title: LocalizedStringSchema, description: LocalizedStringSchema }))
    .max(30)
    .default([]),
  faqs: z
    .array(z.object({ question: LocalizedStringSchema, answer: LocalizedStringSchema }))
    .max(30)
    .default([]),
  // The steps that show how the service is set up
  process: z
    .array(z.object({ title: LocalizedStringSchema, description: LocalizedStringSchema }))
    .max(30)
    .default([]),
  // The group this service belongs to; null for a top-level group
  parent: ObjectIdString.nullable().default(null),
  technologies: z.array(ObjectIdString).default([]),
  category: ObjectIdString.nullable().default(null),
  isFeatured: z.boolean().default(false),
  order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  seo: SeoMetadataSchema.optional(),
  updatedAt: z.string().optional(),
});

export const ServiceUpdateSchema = ServiceSchema.partial();
