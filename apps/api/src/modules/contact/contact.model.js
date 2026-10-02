import mongoose from 'mongoose';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';

const noteSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const contactRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    company: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    serviceName: {
      type: String,
      default: '',
    },
    projectType: {
      type: String,
      default: '',
    },
    budget: {
      type: String,
      default: '',
    },
    timeline: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '',
      maxlength: 150,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'chat'],
      default: 'email',
    },
    referralSource: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'in_review', 'replied', 'closed', 'spam'],
      default: 'new',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: [noteSchema],
    spam: {
      isSpam: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
      reasons: [{ type: String }],
    },
    consent: {
      accepted: { type: Boolean, default: true },
      acceptedAt: { type: Date, default: Date.now },
      policyVersion: { type: String, default: '1.0' },
    },
    meta: {
      ip: String,
      userAgent: String,
      referrer: String,
      pageUrl: String,
      locale: {
        type: String,
        enum: ['vi', 'en'],
        default: 'vi',
      },
      utm: {
        source: String,
        medium: String,
        campaign: String,
      },
    },
    notification: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'failed'],
        default: 'pending',
      },
      attempts: {
        type: Number,
        default: 0,
      },
      lastError: String,
      sentAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

contactRequestSchema.plugin(softDeletePlugin);

contactRequestSchema.index({ status: 1, createdAt: -1 });
contactRequestSchema.index({ createdAt: -1, _id: -1 });
contactRequestSchema.index({ email: 1 });
contactRequestSchema.index({ assignee: 1, status: 1 });
contactRequestSchema.index({ 'notification.status': 1 });

export const ContactRequestModel = mongoose.model('ContactRequest', contactRequestSchema);
