import mongoose from 'mongoose';
import { publishablePlugin } from '../../core/db/plugins/publishable.js';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';
import { localizedPlugin } from '../../core/db/plugins/localized.js';
import { sluggablePlugin } from '../../core/db/plugins/sluggable.js';

const imageRefSchema = new mongoose.Schema(
  {
    publicId: { type: String, default: '' },
    url: { type: String, default: '' },
    width: { type: Number },
    height: { type: Number },
    alt: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      vi: { type: String, required: true },
      en: { type: String, default: '' },
    },
    shortDescription: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    client: {
      name: { type: String, default: '' },
      industry: {
        vi: { type: String, default: '' },
        en: { type: String, default: '' },
      },
      country: { type: String, default: '' },
      logo: { type: imageRefSchema, default: () => ({}) },
      isConfidential: { type: Boolean, default: false },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
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
    challenge: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    solution: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    features: [
      {
        title: {
          vi: { type: String, default: '' },
          en: { type: String, default: '' },
        },
        description: {
          vi: { type: String, default: '' },
          en: { type: String, default: '' },
        },
      },
    ],
    results: [
      {
        label: {
          vi: { type: String, default: '' },
          en: { type: String, default: '' },
        },
        value: {
          vi: { type: String, default: '' },
          en: { type: String, default: '' },
        },
        description: {
          vi: { type: String, default: '' },
          en: { type: String, default: '' },
        },
      },
    ],
    coverImage: {
      type: imageRefSchema,
      default: () => ({}),
    },
    gallery: [
      {
        image: { type: imageRefSchema, default: () => ({}) },
        caption: {
          vi: { type: String, default: '' },
          en: { type: String, default: '' },
        },
      },
    ],
    projectUrl: { type: String, default: '' },
    repositoryUrl: { type: String, default: '' },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    isFeatured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0, index: true },
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

projectSchema.plugin(sluggablePlugin, { source: 'title', localized: true });
projectSchema.plugin(publishablePlugin);
projectSchema.plugin(softDeletePlugin);
projectSchema.plugin(auditablePlugin);
projectSchema.plugin(localizedPlugin, { requiredFields: ['title', 'shortDescription'] });

projectSchema.index({ status: 1, order: 1 });
projectSchema.index(
  { 'slug.vi': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
projectSchema.index(
  { 'slug.en': 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);
projectSchema.index({ category: 1, status: 1, publishedAt: -1 });
projectSchema.index({ services: 1, publishedAt: -1 });
projectSchema.index({ technologies: 1, publishedAt: -1 });

export const ProjectModel =
  mongoose.models.Project || mongoose.model('Project', projectSchema, 'projects');
