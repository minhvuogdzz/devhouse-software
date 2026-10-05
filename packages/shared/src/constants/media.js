/**
 * Image upload rules shared by the admin (which compresses before uploading)
 * and the API (which enforces them again when an upload is registered).
 */

/** Largest allowed size of one uploaded image, in bytes. */
export const MEDIA_MAX_BYTES = 1_000_000;

/** Every uploaded image is stored as WebP. */
export const MEDIA_IMAGE_FORMAT = 'webp';

/** Longest edge, in pixels, an uploaded image is scaled down to. */
export const MEDIA_MAX_EDGE = 2000;

/** Largest source file the admin accepts before compressing, in bytes. */
export const MEDIA_MAX_SOURCE_BYTES = 25_000_000;

/** Source types the browser can decode and convert to WebP. */
export const MEDIA_SOURCE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
