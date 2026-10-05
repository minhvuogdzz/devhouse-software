import mongoose from 'mongoose';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';
import { localizedPlugin } from '../../core/db/plugins/localized.js';
import { sluggablePlugin } from '../../core/db/plugins/sluggable.js';

const localizedText = () => ({
  vi: { type: String, default: '' },
  en: { type: String, default: '' },
});

/**
 * A sellable package: a one-time setup fee plus a recurring fee (per quarter or year).
 * Prices are optional; while empty the site shows "contact us for a quote".
 */
const packageSchema = new mongoose.Schema(
  {
    name: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
    audience: localizedText(),
    shortDescription: localizedText(),
    inclusions: {
      type: [new mongoose.Schema({ text: localizedText() }, { _id: false })],
      default: [],
    },
    supportHours: localizedText(),
    setupFee: { type: Number, default: null, min: 0 },
    recurringFee: { type: Number, default: null, min: 0 },
    recurringPeriod: { type: String, enum: ['quarter', 'year'], default: 'year' },
    currency: { type: String, enum: ['VND', 'USD', 'EUR'], default: 'VND' },
    priceNote: localizedText(),
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0, index: true },
    seo: {
      title: localizedText(),
      description: localizedText(),
      canonicalUrl: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

packageSchema.plugin(sluggablePlugin, { source: 'name', localized: true });
packageSchema.plugin(publishablePlugin);
packageSchema.plugin(softDeletePlugin);
packageSchema.plugin(auditablePlugin);
packageSchema.plugin(localizedPlugin, { requiredFields: ['name', 'shortDescription'] });

packageSchema.index({ status: 1, order: 1 });
packageSchema.index(
  { 'slug.vi': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false, 'slug.vi': { $type: 'string' } } },
);

packageSchema.index(
  { 'slug.en': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false, 'slug.en': { $gt: '' } } },
);

export const PackageModel =
  mongoose.models.Package || mongoose.model('Package', packageSchema, 'packages');
