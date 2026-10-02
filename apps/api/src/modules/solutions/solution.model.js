import mongoose from 'mongoose';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';
import { localizedPlugin } from '../../core/db/plugins/localized.js';
import { sluggablePlugin } from '../../core/db/plugins/sluggable.js';

const solutionSchema = new mongoose.Schema(
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
    targetAudience: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
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

solutionSchema.plugin(sluggablePlugin, { source: 'name', localized: true });
solutionSchema.plugin(publishablePlugin);
solutionSchema.plugin(softDeletePlugin);
solutionSchema.plugin(auditablePlugin);
solutionSchema.plugin(localizedPlugin, { requiredFields: ['name', 'shortDescription'] });

solutionSchema.index({ status: 1, order: 1 });
solutionSchema.index(
  { 'slug.vi': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
solutionSchema.index(
  { 'slug.en': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export const SolutionModel =
  mongoose.models.Solution || mongoose.model('Solution', solutionSchema, 'solutions');
