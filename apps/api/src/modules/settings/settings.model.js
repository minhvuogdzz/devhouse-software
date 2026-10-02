import mongoose from 'mongoose';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const settingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

settingsSchema.plugin(auditablePlugin);

export const SettingsModel =
  mongoose.models.Settings || mongoose.model('Settings', settingsSchema, 'site_settings');
