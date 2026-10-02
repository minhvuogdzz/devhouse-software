import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: {
      vi: { type: String, required: true },
      en: { type: String, default: '' },
    },
    slug: {
      vi: { type: String, required: true, trim: true },
      en: { type: String, default: '', trim: true },
    },
  },
  {
    timestamps: true,
  },
);

tagSchema.index({ 'slug.vi': 1 }, { unique: true });

export const TagModel = mongoose.models.Tag || mongoose.model('Tag', tagSchema, 'tags');
