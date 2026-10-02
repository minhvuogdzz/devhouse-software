import mongoose from 'mongoose';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const roleSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      vi: { type: String, required: true },
      en: { type: String, default: '' },
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    permissions: {
      type: [String],
      required: true,
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

roleSchema.plugin(auditablePlugin);

export const RoleModel = mongoose.models.Role || mongoose.model('Role', roleSchema, 'roles');
