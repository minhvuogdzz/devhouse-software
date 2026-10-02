import mongoose from 'mongoose';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const redirectSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    to: {
      type: String,
      required: true,
      trim: true,
    },
    statusCode: {
      type: Number,
      enum: [301, 302],
      default: 301,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  },
);

redirectSchema.plugin(auditablePlugin);

export const RedirectModel =
  mongoose.models.Redirect || mongoose.model('Redirect', redirectSchema, 'redirects');
