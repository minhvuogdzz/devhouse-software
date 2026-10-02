import mongoose from 'mongoose';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    role: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    bio: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    avatar: {
      publicId: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    links: [
      {
        platform: { type: String, default: '' },
        url: { type: String, default: '' },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: { sparse: true },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

authorSchema.plugin(auditablePlugin);

export const AuthorModel =
  mongoose.models.Author || mongoose.model('Author', authorSchema, 'authors');
