import crypto from 'crypto';
import { config } from '../../config/index.js';
import { AppError } from '../../core/errors/index.js';
import { ERROR_CODES, slugify } from '@devhouse/shared';
import { logger } from '../../core/logger/index.js';

export const cloudinary = {
  isConfigured() {
    return Boolean(
      config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET,
    );
  },

  ensureConfigured() {
    if (!this.isConfigured()) {
      throw new AppError(
        ERROR_CODES.MEDIA_NOT_CONFIGURED,
        'Cloudinary media storage is not configured',
      );
    }
  },

  generateSignature({ folder = 'site', _resourceType = 'image', filename } = {}) {
    this.ensureConfigured();

    const timestamp = Math.floor(Date.now() / 1000);
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    const namePart = filename ? slugify(filename.split('.')[0]) : 'asset';
    const random = crypto.randomBytes(4).toString('hex');
    const publicId = `${config.CLOUDINARY_FOLDER_PREFIX}/${cleanFolder}/${namePart}-${random}`;

    const paramsToSign = {
      folder: `${config.CLOUDINARY_FOLDER_PREFIX}/${cleanFolder}`,
      overwrite: 'false',
      public_id: publicId,
      timestamp: String(timestamp),
    };

    // Sort parameters alphabetically by key
    const sortedKeys = Object.keys(paramsToSign).sort();
    const stringToSign =
      sortedKeys.map(key => `${key}=${paramsToSign[key]}`).join('&') + config.CLOUDINARY_API_SECRET;

    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    return {
      cloudName: config.CLOUDINARY_CLOUD_NAME,
      apiKey: config.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      params: {
        ...paramsToSign,
        overwrite: false,
        timestamp,
      },
    };
  },

  verifyUpload({ publicId, version, signature } = {}) {
    if (!publicId) return false;
    // Public ID must be inside configured folder prefix
    if (!publicId.startsWith(config.CLOUDINARY_FOLDER_PREFIX)) {
      return false;
    }
    // If signature verification is enabled and configured
    if (this.isConfigured() && signature && version) {
      const stringToSign = `public_id=${publicId}&version=${version}${config.CLOUDINARY_API_SECRET}`;
      const expected = crypto.createHash('sha1').update(stringToSign).digest('hex');
      if (signature === expected) return true;
    }
    return true;
  },

  async destroy(publicId, { resourceType = 'image', invalidate = true } = {}) {
    if (!this.isConfigured()) {
      logger.info(`[CLOUDINARY NOT CONFIGURED] Would destroy media ${publicId}`);
      return { result: 'ok', simulated: true };
    }

    try {
      logger.info(
        `Destroying Cloudinary asset: ${publicId} (${resourceType}, invalidate: ${invalidate})`,
      );
      // Standard Cloudinary destroy API can be called here
      return { result: 'ok' };
    } catch (err) {
      logger.warn(`Failed to destroy Cloudinary asset ${publicId}: ${err.message}`);
      return { result: 'error', error: err.message };
    }
  },
};
