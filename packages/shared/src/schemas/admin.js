import { z } from 'zod';
import { LocalizedStringSchema } from './common.js';
import { PERMISSIONS } from '../permissions.js';

export const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required'),
  roleKeys: z.array(z.string()).min(1, 'At least one role is required'),
  status: z.enum(['active', 'disabled']).default('active'),
  password: z.string().min(8).optional(),
});

export const RoleSchema = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9_-]+$/),
  name: LocalizedStringSchema,
  description: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  isSystem: z.boolean().default(false),
  permissions: z.array(z.string().refine(p => p === '*' || PERMISSIONS.includes(p))),
});

export const RedirectSchema = z.object({
  sourcePath: z.string().min(1).startsWith('/'),
  targetPath: z.string().min(1),
  statusCode: z.union([z.literal(301), z.literal(302)]).default(301),
  note: z.string().optional().default(''),
});

export const MediaSignatureRequestSchema = z.object({
  folder: z.string().min(1).default('site'),
  resourceType: z.enum(['image', 'video', 'raw']).default('image'),
  filename: z.string().optional(),
});

export const MediaRegistrationSchema = z
  .object({
    publicId: z.string().min(1).optional(),
    public_id: z.string().min(1).optional(),
    url: z.string().optional(),
    secure_url: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
    format: z.string().optional(),
    resourceType: z.enum(['image', 'raw', 'video']).optional(),
    resource_type: z.enum(['image', 'raw', 'video']).optional(),
    bytes: z.number().int().positive().optional(),
    version: z.number().int().positive().optional(),
    originalFilename: z.string().optional(),
    original_filename: z.string().optional(),
    title: z.string().optional().default(''),
    alt: z.union([z.string(), LocalizedStringSchema]).optional().default({ vi: '', en: '' }),
    isDecorative: z.boolean().optional().default(false),
    caption: z.union([z.string(), LocalizedStringSchema]).optional().default({ vi: '', en: '' }),
    folder: z.string().optional().default('site'),
    tags: z.array(z.string()).optional().default([]),
    signature: z.string().optional(),
  })
  .transform(val => {
    const publicId = val.publicId || val.public_id;
    const resourceType = val.resourceType || val.resource_type || 'image';
    const originalFilename = val.originalFilename || val.original_filename || '';
    const url = val.secure_url || val.url || '';
    return {
      ...val,
      publicId,
      resourceType,
      originalFilename,
      url,
    };
  });

export const MediaUpdateSchema = z.object({
  title: z.string().optional(),
  alt: z.union([z.string(), LocalizedStringSchema]).optional(),
  isDecorative: z.boolean().optional(),
  caption: z.union([z.string(), LocalizedStringSchema]).optional(),
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
