import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeDisplay } from '@devhouse/shared';
import { DisplayField } from './DisplayField.jsx';

const draw = value =>
  renderToStaticMarkup(React.createElement(DisplayField, { value, onChange() {} }));

describe('DisplayField', () => {
  it('offers grid, list and slide, with the current one chosen', () => {
    const html = draw(makeDisplay({ layout: 'grid' }));
    expect(html).toContain('Lưới');
    expect(html).toContain('Danh sách');
    expect(html).toContain('Trượt');
    expect(html).toMatch(/aria-checked="true"[^>]*>(?:(?!<\/button>).)*Lưới/s);
  });

  it('asks for the columns of a phone, a tablet and a computer', () => {
    const html = draw(makeDisplay({ layout: 'grid' }));
    expect(html).toContain('Số cột trên Điện thoại');
    expect(html).toContain('Số cột trên Máy tính bảng');
    expect(html).toContain('Số cột trên Máy tính');
  });

  it('does not ask for columns when each item has its own row', () => {
    const html = draw(makeDisplay({ layout: 'list' }));
    expect(html).not.toContain('Số cột trên');
  });

  it('shows the slide options only for a slide', () => {
    expect(draw(makeDisplay({ layout: 'grid' }))).not.toContain('Kiểu chấm');
    const html = draw(
      makeDisplay({ layout: 'slide', slide: { motion: 'step', dots: 'progress' } }),
    );
    expect(html).toContain('Từng trang');
    expect(html).toContain('Chạy liên tục');
    expect(html).toContain('Chấm tròn');
    expect(html).toContain('Chấm tiến trình');
    expect(html).toContain('Chấm trượt');
    expect(html).toContain('Tự động chạy');
  });

  it('has no dots to choose for a slide that runs without stopping', () => {
    const html = draw(
      makeDisplay({ layout: 'slide', slide: { motion: 'smooth', autoplay: true } }),
    );
    expect(html).not.toContain('Kiểu chấm');
    expect(html).toContain('Thời gian mỗi mục đi qua');
  });
});
