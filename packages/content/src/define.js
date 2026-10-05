import { z } from 'zod';
import {
  LocalizedStringSchema,
  ImageRefSchema,
  DISPLAY_LAYOUTS,
  DISPLAY_MAX_COLUMNS,
  DOT_STYLES,
  SLIDE_INTERVAL_MAX,
  SLIDE_INTERVAL_MIN,
  SLIDE_MOTIONS,
} from '@devhouse/shared';

const columnCount = z.number().int().min(1).max(DISPLAY_MAX_COLUMNS).optional();

/** How a list is shown (layout, columns per device, slide settings). See @devhouse/shared display. */
const DisplaySchema = z
  .object({
    layout: z.enum(DISPLAY_LAYOUTS).optional(),
    columns: z
      .object({ mobile: columnCount, tablet: columnCount, desktop: columnCount })
      .optional(),
    slide: z
      .object({
        motion: z.enum(SLIDE_MOTIONS).optional(),
        autoplay: z.boolean().optional(),
        interval: z.number().min(SLIDE_INTERVAL_MIN).max(SLIDE_INTERVAL_MAX).optional(),
        dots: z.enum(DOT_STYLES).optional(),
        arrows: z.boolean().optional(),
      })
      .optional(),
  })
  .optional();

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
  // How a list on the page is shown: grid, list or slide, with columns for each device.
  display: (opts = {}) => ({
    type: 'display',
    layouts: opts.layouts ?? DISPLAY_LAYOUTS,
    maxColumns: opts.maxColumns ?? DISPLAY_MAX_COLUMNS,
  }),
  // Any number of pictures, each with an optional caption (for example a photo slider).
  gallery: () => ({
    type: 'gallery',
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

    case 'display':
      return DisplaySchema;

    case 'gallery':
      return z
        .array(
          z.object({
            image: ImageRefSchema.nullable().optional(),
            caption: LocalizedStringSchema.optional(),
          }),
        )
        .optional();

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
  const { key, label, summary = '', fields = {}, defaults = {} } = config;

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
    // One plain sentence for the admin: what the section is and where it shows on the website
    summary,
    fields,
    defaults: {
      visible: true,
      ...defaults,
    },
    schema,
  };
}
