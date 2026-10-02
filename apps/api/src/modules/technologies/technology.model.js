import mongoose from 'mongoose';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const technologySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    categorySlug: {
      type: String,
      default: null,
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    icon: {
      type: String,
      default: '',
    },
    websiteUrl: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

technologySchema.plugin(publishablePlugin);
technologySchema.plugin(softDeletePlugin);
technologySchema.plugin(auditablePlugin);

technologySchema.index({ status: 1, order: 1 });
technologySchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const TechnologyModel =
  mongoose.models.Technology || mongoose.model('Technology', technologySchema, 'technologies');
