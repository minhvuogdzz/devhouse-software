import { describe, it, expect } from 'vitest';
import vi from '../app/locales/vi.js';
import en from '../app/locales/en.js';

describe('Search and DH AI Translations', () => {
  it('has complete search dictionary in Vietnamese', () => {
    expect(vi.header.search).toBeDefined();
    expect(vi.search).toBeDefined();
    expect(vi.search.aiMode).toBe('DH AI Search');
    expect(vi.search.placeholder).toBeDefined();
    expect(vi.search.aiPlaceholder).toBeDefined();
    expect(vi.search.thinking).toContain('DH AI');
  });

  it('has complete search dictionary in English', () => {
    expect(en.header.search).toBeDefined();
    expect(en.search).toBeDefined();
    expect(en.search.aiMode).toBe('DH AI Search');
    expect(en.search.placeholder).toBeDefined();
    expect(en.search.aiPlaceholder).toBeDefined();
    expect(en.search.thinking).toContain('DH AI');
  });

  it('strictly adheres to DH AI branding and never mentions third-party AI providers in UI', () => {
    const viString = JSON.stringify(vi);
    const enString = JSON.stringify(en);

    expect(viString.toLowerCase()).not.toContain('gemini');
    expect(viString.toLowerCase()).not.toContain('openai');
    expect(enString.toLowerCase()).not.toContain('gemini');
    expect(enString.toLowerCase()).not.toContain('openai');
  });
});
