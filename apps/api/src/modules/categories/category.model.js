import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['service', 'solution', 'project', 'technology'],
      required: true,
      index: true,
    },
    name: {
      vi: { type: String, required: true },
      en: { type: String, default: '' },
    },
    slug: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
    description: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
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

categorySchema.index({ type: 1, 'slug.vi': 1 }, { unique: true });

export const CategoryModel =
  mongoose.models.Category || mongoose.model('Category', categorySchema, 'categories');
