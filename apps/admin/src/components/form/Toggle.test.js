import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Toggle } from './Toggle.jsx';
import { Input } from '../ui/Input.jsx';

const ids = (html, tag) =>
  [...html.matchAll(new RegExp(`<${tag}[^>]*?\\sid="([^"]+)"`, 'g'))].map(m => m[1]);
const forAttrs = html => [...html.matchAll(/<label[^>]*?\sfor="([^"]+)"/g)].map(m => m[1]);

describe('form controls that repeat the same label', () => {
  it('give every switch its own id, and each label points at its own switch', () => {
    // One "visible on the website" switch per menu item, as in Admin → Menu điều hướng
    const html = renderToStaticMarkup(
      React.createElement(
        'div',
        null,
        ['Dịch vụ', 'Mẫu website', 'Dự án'].map(item =>
          React.createElement(Toggle, {
            key: item,
            label: 'Hiển thị trên website',
            checked: true,
            onChange: () => {},
          }),
        ),
      ),
    );
    const inputIds = ids(html, 'input');
    expect(inputIds).toHaveLength(3);
    expect(new Set(inputIds).size).toBe(3);
    expect(forAttrs(html)).toEqual(inputIds);
  });

  it('give every labelled text field its own id as well', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        'div',
        null,
        [1, 2].map(n =>
          React.createElement(Input, { key: n, label: 'Đường dẫn', value: '', onChange: () => {} }),
        ),
      ),
    );
    const inputIds = ids(html, 'input');
    expect(new Set(inputIds).size).toBe(2);
    expect(forAttrs(html)).toEqual(inputIds);
  });
});
