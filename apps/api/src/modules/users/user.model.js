import argon2 from 'argon2';
import mongoose from 'mongoose';

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


const ARGON_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  
  try {
    let match = false;
    let isBcrypt = false;

    // Check if it's a bcrypt hash (starts with $2a$, $2b$, $2y$, etc.)
    if (this.passwordHash.startsWith('$2')) {
      const bcrypt = (await import('bcryptjs')).default;
      match = await bcrypt.compare(candidatePassword, this.passwordHash);
      isBcrypt = true;
    } else {
      match = await argon2.verify(this.passwordHash, candidatePassword);
    }

    // Rehash on login if needed
    if (match && (isBcrypt || argon2.needsRehash(this.passwordHash, ARGON_OPTIONS))) {
      const newHash = await argon2.hash(candidatePassword, ARGON_OPTIONS);
      await this.constructor.updateOne({ _id: this._id }, { $set: { passwordHash: newHash } });
      this.passwordHash = newHash;
    }

    return match;
  } catch (error) {
    return false;
  }
};

userSchema.statics.hashPassword = async function (password) {
  return argon2.hash(password, ARGON_OPTIONS);
};

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema, 'users');
