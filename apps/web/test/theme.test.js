import { describe, it, expect } from 'vitest';
import { themeInitScript } from '../app/lib/theme.js';

describe('Web theme zero-flash script', () => {
  it('contains valid inline script targeting data-theme attribute', () => {
    expect(themeInitScript).toContain('dh-theme');
    expect(themeInitScript).toContain('data-theme');
    expect(themeInitScript).toContain('prefers-color-scheme: dark');
    expect(themeInitScript).toContain('documentElement.setAttribute');
  });
});
