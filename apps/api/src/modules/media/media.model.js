import mongoose from 'mongoose';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const mediaSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw'],
      default: 'image',
    },
    deliveryType: {
      type: String,
      enum: ['upload', 'private'],
      default: 'upload',
    },
    format: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    bytes: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    version: {
      type: Number,
      default: 1,
    },
    url: {
      type: String,
      trim: true,
    },
    originalFilename: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    alt: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ vi: '', en: '' }),
    },
    isDecorative: {
      type: Boolean,
      default: false,
    },
    caption: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ vi: '', en: '' }),
    },
    folder: {
      type: String,
      default: 'site',
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

mediaSchema.plugin(softDeletePlugin);
mediaSchema.plugin(auditablePlugin);

mediaSchema.index({ publicId: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });
mediaSchema.index({ isDeleted: 1, folder: 1, createdAt: -1 });
mediaSchema.index({ resourceType: 1, createdAt: -1 });
mediaSchema.index(
  { title: 'text', originalFilename: 'text', tags: 'text' },
  { default_language: 'none' },
);

export const MediaModel = mongoose.model('Media', mediaSchema);
