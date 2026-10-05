import { describe, it, expect } from 'vitest';
import { diffAgainstDefaults, diffSections, isEqual } from './content-diff.js';

const defaults = {
  heading: { vi: 'Xin chào', en: 'Hello' },
  visible: true,
  cta: { label: { vi: 'Xem', en: 'See' }, url: '/a' },
  steps: [{ title: { vi: 'Một', en: 'One' } }],
};

describe('diffAgainstDefaults', () => {
  it('returns nothing when nothing changed', () => {
    expect(diffAgainstDefaults(structuredClone(defaults), defaults)).toBeUndefined();
  });

  it('keeps only the fields that changed', () => {
    const edited = structuredClone(defaults);
    edited.heading.en = 'Hi there';
    edited.cta.url = '/b';
    expect(diffAgainstDefaults(edited, defaults)).toEqual({
      heading: { vi: 'Xin chào', en: 'Hi there' },
      cta: { label: { vi: 'Xem', en: 'See' }, url: '/b' },
    });
  });

  it('replaces a list as a whole when any item changed', () => {
    const edited = structuredClone(defaults);
    edited.steps.push({ title: { vi: 'Hai', en: 'Two' } });
    expect(diffAgainstDefaults(edited, defaults)).toEqual({ steps: edited.steps });
  });

  it('keeps a visibility switch that was turned off', () => {
    const edited = { ...structuredClone(defaults), visible: false };
    expect(diffAgainstDefaults(edited, defaults)).toEqual({ visible: false });
  });
});

describe('diffSections', () => {
  it('drops untouched sections', () => {
    const edited = { hero: structuredClone(defaults), other: { text: { vi: 'a', en: 'b' } } };
    edited.hero.visible = false;
    expect(diffSections(edited, { hero: defaults, other: { text: { vi: 'a', en: 'b' } } })).toEqual(
      {
        hero: { visible: false },
      },
    );
  });
});

describe('isEqual', () => {
  it('compares nested values', () => {
    expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(isEqual({ a: [1] }, { a: [2] })).toBe(false);
  });
});
