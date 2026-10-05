import { describe, it, expect } from 'vitest';
import { resizedImage } from '../app/lib/images.js';

const base = 'https://res.cloudinary.com/demo/image/upload';

describe('resizedImage', () => {
  it('asks Cloudinary for a smaller picture in a modern format', () => {
    expect(resizedImage(`${base}/v123/devhouse/a.webp`, 640)).toBe(
      `${base}/f_auto,q_auto,c_limit,w_640/v123/devhouse/a.webp`,
    );
  });

  it('does not add a second transformation', () => {
    const already = `${base}/w_300,c_fill/v123/a.webp`;
    expect(resizedImage(already, 640)).toBe(already);
  });

  it('leaves other addresses untouched and survives bad input', () => {
    expect(resizedImage('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(resizedImage(undefined)).toBe('');
    expect(resizedImage(null)).toBe('');
  });
});
