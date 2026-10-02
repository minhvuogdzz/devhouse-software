import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      id: { type: String, default: null },
      email: { type: String, default: null },
      roleKeys: { type: [String], default: [] },
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: {
      type: { type: String, required: true },
      id: { type: String, default: null },
      label: { type: String, default: null },
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    outcome: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
      index: true,
    },
    requestId: {
      type: String,
      index: true,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const AuditLogModel =
  mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema, 'audit_logs');
