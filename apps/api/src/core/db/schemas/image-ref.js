import mongoose from 'mongoose';

/** Snapshot of a media-library image stored inside content (so reads need no join). */
export const imageRefSchema = new mongoose.Schema(
  {
    mediaId: { type: String, default: '' },
    publicId: { type: String, default: '' },
    url: { type: String, default: '', trim: true },
    width: { type: Number },
    height: { type: Number },
    alt: {
      vi: { type: String, default: '' },
      en: { type: String, default: '' },
    },
  },
  { _id: false },
);
