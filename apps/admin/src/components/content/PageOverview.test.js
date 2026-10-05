import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeDisplay } from '@devhouse/shared';
import { PageOverview, displayFieldOf } from './PageOverview.jsx';

const sections = [
  {
    key: 'hero',
    label: 'Hero',
    summary: 'Khối đầu tiên của trang.',
    fields: { heading: { type: 'text' } },
  },
  {
    key: 'values',
    label: 'Giá trị',
    summary: 'Các thẻ cam kết.',
    fields: { items: { type: 'list' }, display: { type: 'display', maxColumns: 4 } },
  },
  {
    key: 'process',
    label: 'Quy trình',
    summary: 'Các bước làm việc.',
    fields: { display: { type: 'display' } },
  },
];

const values = {
  hero: { visible: true },
  values: {
    visible: true,
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
  },
  process: { visible: false, display: makeDisplay({ layout: 'list' }) },
};

const draw = (props = {}) =>
  renderToStaticMarkup(
    React.createElement(PageOverview, {
      sections,
      values,
      labelOf: section => section.label,
      onChange() {},
      onEdit() {},
      ...props,
    }),
  );

describe('PageOverview', () => {
  it('lists every section in order, with its name and what it is', () => {
    const html = draw();
    const hero = html.indexOf('1. Hero');
    const valuesAt = html.indexOf('2. Giá trị');
    const process = html.indexOf('3. Quy trình');
    expect(hero).toBeGreaterThan(-1);
    expect(valuesAt).toBeGreaterThan(hero);
    expect(process).toBeGreaterThan(valuesAt);
    expect(html).toContain('Khối đầu tiên của trang.');
    expect(html.match(/Sửa nội dung/g)).toHaveLength(3);
  });

  it('has one switch per section, on unless the section is hidden', () => {
    const html = draw();
    expect(html.match(/type="checkbox"/g)).toHaveLength(3);
    expect(html.match(/checked=""/g)).toHaveLength(2);
    expect(html).toContain('Đang hiện 2/3 khối');
    expect(html.match(/Đang ẩn/g)).toHaveLength(1);
  });

  it('treats a section with no setting as shown', () => {
    const html = draw({ values: {} });
    expect(html.match(/checked=""/g)).toHaveLength(3);
    expect(html).toContain('Đang hiện 3/3 khối');
  });

  it('shows how a list is displayed only for the sections that show a list', () => {
    const html = draw();
    expect(html.match(/Kiểu hiển thị:/g)).toHaveLength(2);
    expect(html).toContain('Lưới · 4 cột trên máy tính, 2 trên máy tính bảng, 1 trên điện thoại');
    expect(html).toContain('Danh sách');
    // the settings stay closed until asked for
    expect(html).not.toContain('Số cột trên');
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(2);
  });

  it('finds the display field of a section', () => {
    expect(displayFieldOf(sections[0])).toBeNull();
    expect(displayFieldOf(sections[1])).toEqual({
      name: 'display',
      descriptor: { type: 'display', maxColumns: 4 },
    });
  });
});
