import mongoose from 'mongoose';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';
import { localizedPlugin } from '../../core/db/plugins/localized.js';
import { sluggablePlugin } from '../../core/db/plugins/sluggable.js';
import { imageRefSchema } from '../../core/db/schemas/image-ref.js';

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

const faqSchema = new mongoose.Schema(
  {
    question: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    answer: {
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
    // A service type belongs to one of the top-level service groups. Only two levels are allowed.
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true,
    },
    image: {
      type: imageRefSchema,
      default: null,
    },
    billing: {
      type: String,
      enum: ['one_time', 'recurring', 'yearly'],
      default: 'recurring',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    features: {
      type: [featureSchema],
      default: [],
    },
    faqs: {
      type: [faqSchema],
      default: [],
    },
    // How the service is set up, step by step (same shape as a feature: a title and a text)
    process: {
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

// Keep the structure simple: a group holds types, and a type cannot hold anything.
serviceSchema.pre('validate', async function () {
  if (!this.parent) return;
  if (this._id.equals(this.parent)) {
    this.invalidate('parent', 'A service cannot be placed inside itself');
    return;
  }
  const Service = this.constructor;
  const parent = await Service.findById(this.parent).select('parent').lean();
  if (!parent) {
    this.invalidate('parent', 'The group does not exist');
  } else if (parent.parent) {
    this.invalidate('parent', 'A service can only be placed inside a top-level group');
  } else if (await Service.exists({ parent: this._id })) {
    this.invalidate(
      'parent',
      'This service has services inside it, so it cannot be placed in another',
    );
  }
});

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
