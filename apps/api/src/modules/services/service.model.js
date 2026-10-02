import mongoose from 'mongoose';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';
import { localizedPlugin } from '../../core/db/plugins/localized.js';
import { sluggablePlugin } from '../../core/db/plugins/sluggable.js';

const featureSchema = new mongoose.Schema(
  {
    title: {
      vi: { type: String, required: true },
      en: { type: String, default: '' },
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
  },
  { _id: false },
);

const serviceSchema = new mongoose.Schema(
  {
    name: {
      vi: { type: String, required: true },
      en: { type: String, default: '' },
    },
    shortDescription: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    icon: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    features: {
      type: [featureSchema],
      default: [],
    },
    technologies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technology',
      },
    ],
    seo: {
      title: {
        vi: { type: String, default: '' },
        en: { type: String, default: '' },
      },
      description: {
        vi: { type: String, default: '' },
        en: { type: String, default: '' },
      },
      canonicalUrl: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  },
);

serviceSchema.plugin(sluggablePlugin, { source: 'name', localized: true });
serviceSchema.plugin(publishablePlugin);
serviceSchema.plugin(softDeletePlugin);
serviceSchema.plugin(auditablePlugin);
serviceSchema.plugin(localizedPlugin, { requiredFields: ['name', 'shortDescription'] });

serviceSchema.index({ status: 1, order: 1 });
serviceSchema.index(
  { 'slug.vi': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
serviceSchema.index(
  { 'slug.en': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const ServiceModel =
  mongoose.models.Service || mongoose.model('Service', serviceSchema, 'services');
