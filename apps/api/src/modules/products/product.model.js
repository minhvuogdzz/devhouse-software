import mongoose from 'mongoose';
import { isEmbeddableDemoUrl } from '@devhouse/shared';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';
import { localizedPlugin } from '../../core/db/plugins/localized.js';
import { sluggablePlugin } from '../../core/db/plugins/sluggable.js';
import { imageRefSchema } from '../../core/db/schemas/image-ref.js';

const MAX_THUMBNAILS = 3;

/**
 * A website template / product shown as a card on the public site.
 * `segment` is the broad area (website, game, app...) and `category` the genre
 * (shop, landing page...). Both are managed by the admin under Categories.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
    shortDescription: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    thumbnails: {
      type: [imageRefSchema],
      default: [],
      validate: {
        validator: value => value.length <= MAX_THUMBNAILS,
        message: `A product can have at most ${MAX_THUMBNAILS} thumbnails`,
      },
    },
    segment: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    views: { type: Number, default: 0, min: 0 },
    demoUrl: {
      type: String,
      default: '',
      trim: true,
      validate: {
        validator: value => value === '' || isEmbeddableDemoUrl(value),
        message: 'Demo link must start with https://',
      },
    },
    isFeatured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
    packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
    seo: {
      title: { vi: { type: String, default: '' }, en: { type: String, default: '' } },
      description: { vi: { type: String, default: '' }, en: { type: String, default: '' } },
      canonicalUrl: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

productSchema.plugin(sluggablePlugin, { source: 'name', localized: true });
productSchema.plugin(publishablePlugin);
productSchema.plugin(softDeletePlugin);
productSchema.plugin(auditablePlugin);
productSchema.plugin(localizedPlugin, { requiredFields: ['name', 'shortDescription'] });

productSchema.index({ status: 1, order: 1 });
productSchema.index({ segment: 1, category: 1, order: 1 });
productSchema.index(
  { 'slug.vi': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false, 'slug.vi': { $type: 'string' } } },
);

productSchema.index(
  { 'slug.en': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false, 'slug.en': { $gt: '' } } },
);

export const ProductModel =
  mongoose.models.Product || mongoose.model('Product', productSchema, 'products');
