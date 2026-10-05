import {
  MEDIA_MAX_BYTES,
  MEDIA_MAX_EDGE,
  MEDIA_MAX_SOURCE_BYTES,
  MEDIA_SOURCE_TYPES,
} from '@devhouse/shared';
import { apiClient } from './api-client.js';

/**
 * Local image upload pipeline for the admin:
 *   pick a file -> convert to WebP and shrink to under 1 MB in the browser
 *   -> upload straight to Cloudinary with a signature from our API
 *   -> register the asset with our API, which checks it again on the server.
 */

// Aim a little below the hard limit so a re-encode by the server can never push it over.
const TARGET_BYTES = Math.floor(MEDIA_MAX_BYTES * 0.97);
const MAX_QUALITY = 0.92;
const MIN_QUALITY = 0.35;

export class ImageUploadError extends Error {}

export function formatBytes(bytes) {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(2).replace('.', ',')} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // fall through to <img> decoding
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageUploadError('Không đọc được ảnh này. Vui lòng thử ảnh khác.'));
    };
    img.src = url;
  });
}

function toWebpBlob(canvas, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', quality));
}

/**
 * Converts any supported image to WebP no larger than MEDIA_MAX_BYTES and MEDIA_MAX_EDGE px.
 * Returns { blob, width, height, originalBytes, bytes }.
 */
export async function compressToWebp(file) {
  if (!MEDIA_SOURCE_TYPES.includes(file.type)) {
    throw new ImageUploadError('Chỉ nhận ảnh JPG, PNG, WebP hoặc AVIF.');
  }
  if (file.size > MEDIA_MAX_SOURCE_BYTES) {
    throw new ImageUploadError(
      `Ảnh gốc quá lớn (${formatBytes(file.size)}). Tối đa ${formatBytes(MEDIA_MAX_SOURCE_BYTES)}.`,
    );
  }

  const bitmap = await decode(file);
  const sourceWidth = bitmap.width;
  const sourceHeight = bitmap.height;
  const longest = Math.max(sourceWidth, sourceHeight);

  // A WebP that already fits is uploaded untouched, so nothing is re-compressed needlessly.
  if (file.type === 'image/webp' && file.size <= TARGET_BYTES && longest <= MEDIA_MAX_EDGE) {
    return {
      blob: file,
      width: sourceWidth,
      height: sourceHeight,
      originalBytes: file.size,
      bytes: file.size,
    };
  }

  let scale = Math.min(1, MEDIA_MAX_EDGE / longest);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    let best = await toWebpBlob(canvas, MAX_QUALITY);
    if (!best || best.type !== 'image/webp') {
      throw new ImageUploadError(
        'Trình duyệt này không xuất được ảnh WebP. Hãy dùng Chrome, Edge hoặc Safari mới.',
      );
    }

    if (best.size > TARGET_BYTES) {
      // Binary-search the highest quality that still fits.
      let low = MIN_QUALITY;
      let high = MAX_QUALITY;
      let fitting = null;
      for (let step = 0; step < 7; step += 1) {
        const mid = (low + high) / 2;
        const candidate = await toWebpBlob(canvas, mid);
        if (candidate && candidate.size <= TARGET_BYTES) {
          fitting = candidate;
          low = mid;
        } else {
          high = mid;
        }
      }
      if (!fitting) {
        scale *= 0.85; // even the lowest quality is too big: shrink the picture and try again
        continue;
      }
      best = fitting;
    }

    if (bitmap.close) bitmap.close();
    return { blob: best, width, height, originalBytes: file.size, bytes: best.size };
  }

  throw new ImageUploadError('Không nén được ảnh xuống dưới 1 MB. Hãy thử ảnh khác.');
}

function sendToCloudinary({ cloudName, endpointFields, blob, filename, onProgress }) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    for (const [key, value] of Object.entries(endpointFields)) form.append(key, String(value));
    form.append('file', blob, filename);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    xhr.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let body = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        // handled below
      }
      if (xhr.status >= 200 && xhr.status < 300 && body?.public_id) resolve(body);
      else reject(new ImageUploadError(body?.error?.message || 'Tải ảnh lên không thành công.'));
    };
    xhr.onerror = () => reject(new ImageUploadError('Mất kết nối khi tải ảnh lên.'));
    xhr.send(form);
  });
}

/**
 * Full pipeline for one local file. `onStage` receives 'compressing' | 'uploading' | 'saving'
 * and `onProgress` receives 0..1 during the upload. Resolves to the registered media document.
 */
export async function uploadLocalImage(file, { folder = 'site', onStage, onProgress } = {}) {
  onStage?.('compressing');
  const compressed = await compressToWebp(file);

  onStage?.('uploading');
  const filename = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`;
  const signature = await apiClient('/admin/media/signature', {
    method: 'POST',
    body: JSON.stringify({ folder, resourceType: 'image', filename }),
  });
  const { cloudName, apiKey, timestamp, signature: sig, params } = signature.data;
  const uploaded = await sendToCloudinary({
    cloudName,
    endpointFields: { ...params, api_key: apiKey, timestamp, signature: sig },
    blob: compressed.blob,
    filename,
    onProgress,
  });

  onStage?.('saving');
  const registered = await apiClient('/admin/media', {
    method: 'POST',
    body: JSON.stringify({
      publicId: uploaded.public_id,
      resourceType: 'image',
      version: uploaded.version,
      signature: uploaded.signature,
      originalFilename: file.name,
      folder,
      title: file.name.replace(/\.[^.]+$/, ''),
    }),
  });

  return {
    media: registered.data,
    originalBytes: compressed.originalBytes,
    bytes: compressed.bytes,
  };
}
