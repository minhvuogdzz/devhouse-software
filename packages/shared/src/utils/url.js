/**
 * A demo page can be shown inside the site (in an iframe) when it is served over HTTPS.
 * Plain HTTP is only allowed for local development.
 */
export function isEmbeddableDemoUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  if (url.protocol === 'https:') return true;
  return url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
}
