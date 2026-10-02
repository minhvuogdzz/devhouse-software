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

export const MediaRegistrationSchema = z.object({
  publicId: z.string().min(1),
  url: z.string().url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().optional(),
  resourceType: z.enum(['image', 'raw', 'video']).default('image'),
  bytes: z.number().int().positive().optional(),
  alt: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
  caption: LocalizedStringSchema.optional().default({ vi: '', en: '' }),
});
