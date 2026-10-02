import { z } from 'zod';
import {
  LocalizedStringSchema,
  LocalizedSlugSchema,
  ImageRefSchema,
  SeoMetadataSchema,
} from './common.js';

export const CategorySchema = z.object({
  type: z.enum(['service', 'solution', 'project', 'technology']),
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

export const ServiceSchema = z.object({
  name: LocalizedStringSchema,
  slug: LocalizedSlugSchema,
  shortDescription: LocalizedStringSchema,
  description: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  icon: z.string().optional().default(''),
  order: z.number().int().default(0),
  category: z.string().optional().nullable(),
  features: z
    .array(
      z.object({
        title: LocalizedStringSchema,
        description: LocalizedStringSchema,
      }),
    )
    .default([]),
  technologies: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.coerce.date().optional().nullable(),
  seo: SeoMetadataSchema.optional().default({}),
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

export const ProjectSchema = z.object({
  title: LocalizedStringSchema,
  slug: LocalizedSlugSchema,
  client: z.string().default(''),
  clientIndustry: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  summary: LocalizedStringSchema,
  challenge: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  solution: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  outcomes: z
    .array(
      z.object({
        metric: z.string().default(''),
        label: LocalizedStringSchema,
      }),
    )
    .default([]),
  services: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  thumbnail: ImageRefSchema.optional().default({ publicId: '', url: '' }),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  publishedAt: z.coerce.date().optional().nullable(),
  seo: SeoMetadataSchema.optional().default({}),
});
