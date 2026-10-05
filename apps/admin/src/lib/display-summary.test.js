import { describe, it, expect } from 'vitest';
import { makeDisplay } from '@devhouse/shared';
import { describeDisplay } from './display-summary.js';

describe('describeDisplay', () => {
  it('tells the columns of a grid for each device', () => {
    expect(
      describeDisplay(
        makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 4 } }),
      ),
    ).toBe('Lưới · 4 cột trên máy tính, 2 trên máy tính bảng, 1 trên điện thoại');
  });

  it('does not mention columns for a list, which has one item per row', () => {
    expect(describeDisplay(makeDisplay({ layout: 'list' }))).toBe('Danh sách');
  });

  it('tells how a slide moves and which dots it has', () => {
    const slide = makeDisplay({
      layout: 'slide',
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      slide: { motion: 'step', autoplay: true, interval: 6, dots: 'progress' },
    });
    expect(describeDisplay(slide)).toBe(
      'Slide · 3 cột trên máy tính, 2 trên máy tính bảng, 1 trên điện thoại · tự chuyển sau 6 giây · chấm tiến trình',
    );
    expect(
      describeDisplay({ ...slide, slide: { ...slide.slide, autoplay: false, dots: 'slide' } }),
    ).toContain('người xem tự lướt · chấm trượt');
  });

  it('says a slide that runs without stopping has no dots', () => {
    const text = describeDisplay(
      makeDisplay({ layout: 'slide', slide: { motion: 'smooth', autoplay: true } }),
    );
    expect(text).toContain('chạy liên tục');
    expect(text).not.toContain('chấm');
  });

  it('falls back to the default look when nothing is set', () => {
    expect(describeDisplay(undefined)).toMatch(/^Lưới/);
  });
});
