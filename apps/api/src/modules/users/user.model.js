import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { softDeletePlugin } from '../../core/db/plugins/soft-delete.js';
import { auditablePlugin } from '../../core/db/plugins/auditable.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roleKeys: {
      type: [String],
      required: true,
      default: ['support'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'disabled'],
      default: 'active',
      index: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    failedLoginCount: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.plugin(softDeletePlugin);
userSchema.plugin(auditablePlugin);

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema, 'users');
