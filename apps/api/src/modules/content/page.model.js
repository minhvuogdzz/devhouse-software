import mongoose from 'mongoose';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const pageSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
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

pageSchema.plugin(auditablePlugin);

export const PageModel = mongoose.models.Page || mongoose.model('Page', pageSchema, 'pages');
