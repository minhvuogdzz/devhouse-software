import { normalizeDisplay } from '@devhouse/shared';

const LAYOUT_NAMES = { grid: 'Lưới', list: 'Danh sách', slide: 'Slide' };
const DOT_NAMES = {
  none: 'không có chấm',
  dot: 'chấm tròn',
  progress: 'chấm tiến trình',
  slide: 'chấm trượt',
};

/**
 * One short line that says how a list looks on the website right now, for the overview of a page:
 * "Lưới · 4 cột trên máy tính, 2 trên máy tính bảng, 1 trên điện thoại".
 */
export function describeDisplay(value) {
  const display = normalizeDisplay(value);
  const parts = [LAYOUT_NAMES[display.layout]];

  // A list has one item per row, so it has no columns
  if (display.layout === 'list') return parts.join(' · ');

  const { desktop, tablet, mobile } = display.columns;
  parts.push(
    `${desktop} cột trên máy tính, ${tablet} trên máy tính bảng, ${mobile} trên điện thoại`,
  );

  if (display.layout === 'slide') {
    const { motion, autoplay, interval, dots } = display.slide;
    if (motion === 'smooth' && autoplay) {
      parts.push('chạy liên tục');
    } else {
      parts.push(autoplay ? `tự chuyển sau ${interval} giây` : 'người xem tự lướt');
      parts.push(DOT_NAMES[dots]);
    }
  }
  return parts.join(' · ');
}
