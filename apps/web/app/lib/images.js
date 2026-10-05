/**
 * Asks Cloudinary for a smaller, modern-format version of an image (WebP/AVIF, sized to the card).
 * Any other URL is returned unchanged.
 */
export function resizedImage(url, width = 600) {
  if (typeof url !== 'string') return '';
  if (!url.startsWith('https://res.cloudinary.com/') || !url.includes('/image/upload/')) return url;
  const [head, tail] = url.split('/image/upload/');
  // Already has a transformation segment (it does not look like v123/... or a folder name)
  if (/^[a-z]_[^/]+/.test(tail)) return url;
  return `${head}/image/upload/f_auto,q_auto,c_limit,w_${width}/${tail}`;
}
