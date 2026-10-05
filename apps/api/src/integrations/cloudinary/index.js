import crypto from 'crypto';
import { config } from '../../config/index.js';
import { AppError } from '../../core/errors/index.js';
import { ERROR_CODES, MEDIA_IMAGE_FORMAT, slugify } from '@devhouse/shared';
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
      allowed_formats: MEDIA_IMAGE_FORMAT,
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

  /** Signs a set of API parameters the way Cloudinary's Admin/Upload API expects. */
  signParams(params) {
    const stringToSign =
      Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== '')
        .sort()
        .map(key => `${key}=${params[key]}`)
        .join('&') + config.CLOUDINARY_API_SECRET;
    return crypto.createHash('sha1').update(stringToSign).digest('hex');
  },

  /**
   * Reads the real metadata of an uploaded asset straight from Cloudinary (Admin API).
   * The browser's own numbers are never trusted. Returns null when the asset does not exist.
   */
  async fetchResource(publicId, { resourceType = 'image' } = {}) {
    this.ensureConfigured();
    const encoded = publicId.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/resources/${resourceType}/upload/${encoded}`;
    const basic = Buffer.from(
      `${config.CLOUDINARY_API_KEY}:${config.CLOUDINARY_API_SECRET}`,
    ).toString('base64');

    let response;
    try {
      response = await fetch(url, {
        headers: { Authorization: `Basic ${basic}` },
        signal: AbortSignal.timeout(10000),
      });
    } catch (err) {
      logger.warn(`Cloudinary lookup failed for ${publicId}: ${err.message}`);
      throw new AppError(ERROR_CODES.UPSTREAM_ERROR, 'Could not reach the media service');
    }

    if (response.status === 404) return null;
    if (!response.ok) {
      logger.warn(`Cloudinary lookup for ${publicId} returned ${response.status}`);
      throw new AppError(ERROR_CODES.UPSTREAM_ERROR, 'The media service rejected the request');
    }
    return response.json();
  },

  async destroy(publicId, { resourceType = 'image', invalidate = true } = {}) {
    if (!this.isConfigured()) {
      logger.info(`[CLOUDINARY NOT CONFIGURED] Would destroy media ${publicId}`);
      return { result: 'ok', simulated: true };
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const params = { invalidate: String(invalidate), public_id: publicId, timestamp };
      const body = new URLSearchParams({
        ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
        api_key: config.CLOUDINARY_API_KEY,
        signature: this.signParams(params),
      });
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
        { method: 'POST', body, signal: AbortSignal.timeout(10000) },
      );
      const result = await response.json().catch(() => ({}));
      logger.info(`Destroyed Cloudinary asset ${publicId}: ${result.result || response.status}`);
      return result;
    } catch (err) {
      logger.warn(`Failed to destroy Cloudinary asset ${publicId}: ${err.message}`);
      return { result: 'error', error: err.message };
    }
  },
};
