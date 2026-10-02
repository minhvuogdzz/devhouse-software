import { z } from 'zod';
import { LocalizedStringSchema, ImageRefSchema } from '@devhouse/shared';

export const field = {
  string: (opts = {}) => ({
    type: 'string',
    max: opts.max,
    required: !!opts.required,
  }),
  text: (opts = {}) => ({
    type: 'text',
    max: opts.max,
    required: !!opts.required,
  }),
  textarea: (opts = {}) => ({
    type: 'textarea',
    max: opts.max,
    required: !!opts.required,
  }),
  richText: (opts = {}) => ({
    type: 'richText',
    required: !!opts.required,
  }),
  image: () => ({
    type: 'image',
  }),
  link: (opts = {}) => ({
    type: 'link',
    required: !!opts.required,
  }),
  boolean: (opts = {}) => ({
    type: 'boolean',
    defaultVal: opts.defaultVal ?? false,
  }),
  select: (opts = {}) => ({
    type: 'select',
    options: opts.options ?? [],
    defaultVal: opts.defaultVal,
  }),
  list: (opts = {}) => ({
    type: 'list',
    of: opts.of,
    min: opts.min,
    max: opts.max,
  }),
  group: (opts = {}) => ({
    type: 'group',
    fields: opts.fields ?? {},
  }),
};

function buildFieldSchema(descriptor) {
  if (!descriptor) return z.any();

  switch (descriptor.type) {
    case 'string':
      return z.string().optional();

    case 'text':
    case 'textarea':
    case 'richText':
      return LocalizedStringSchema.optional();

    case 'image':
      return ImageRefSchema.optional();

    case 'link':
      return z
        .object({
          label: LocalizedStringSchema,
          url: z.string().default(''),
          target: z.enum(['_self', '_blank']).optional().default('_self'),
        })
        .optional();

    case 'boolean':
      return z.boolean().optional();

    case 'select':
      return z.string().optional();

    case 'list': {
      const itemSchema = buildFieldSchema(descriptor.of);
      return z.array(itemSchema).optional();
    }

    case 'group': {
      const shape = {};
      for (const [key, subDesc] of Object.entries(descriptor.fields)) {
        shape[key] = buildFieldSchema(subDesc);
      }
      return z.object(shape).optional();
    }

    default:
      return z.any();
  }
}

export function defineSection(config) {
  const { key, label, fields = {}, defaults = {} } = config;

  const shape = {
    visible: z.boolean().optional().default(true),
  };

  for (const [fieldName, descriptor] of Object.entries(fields)) {
    shape[fieldName] = buildFieldSchema(descriptor);
  }

  const schema = z.object(shape);

  return {
    key,
    label,
    fields,
    defaults: {
      visible: true,
      ...defaults,
    },
    schema,
  };
}
