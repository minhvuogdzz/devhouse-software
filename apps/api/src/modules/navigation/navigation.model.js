import mongoose from 'mongoose';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const navigationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'main',
      index: true,
    },
    header: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    footer: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

navigationSchema.plugin(auditablePlugin);

export const NavigationModel =
  mongoose.models.Navigation || mongoose.model('Navigation', navigationSchema, 'navigation_menus');
