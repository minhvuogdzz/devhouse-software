import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Collection } from '../app/components/ui/Collection.jsx';
import { MAX_DOTS, SliderDots } from '../app/components/ui/SliderDots.jsx';

const items = ['Một', 'Hai', 'Ba', 'Bốn'].map((name, index) => ({ id: index, name }));
const render = display =>
  renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(Collection, {
        items,
        display,
        label: 'Danh sách thử',
        renderItem: (item, _index, { layout }) =>
          React.createElement('div', { 'data-layout': layout }, item.name),
      }),
    ),
  );

describe('Collection', () => {
  it('draws a grid with the columns chosen for each device', () => {
    const html = render({ layout: 'grid', columns: { mobile: 2, tablet: 3, desktop: 5 } });
    expect(html).toContain('collection-grid');
    expect(html).toContain('--cols-m:2');
    expect(html).toContain('--cols-t:3');
    expect(html).toContain('--cols-d:5');
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html).toContain('data-layout="grid"');
  });

  it('draws a list with one item per row and tells each item it is in a list', () => {
    const html = render({ layout: 'list' });
    expect(html).toContain('collection-list');
    expect(html).not.toContain('collection-grid');
    expect(html).toContain('data-layout="list"');
  });

  it('draws a slide that moves one page at a time as a row you can swipe', () => {
    const html = render({
      layout: 'slide',
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      slide: { motion: 'step', autoplay: true, interval: 4, dots: 'dot', arrows: true },
    });
    expect(html).toContain('collection-slider');
    expect(html).toContain('collection-track');
    expect(html).toContain('aria-roledescription="carousel"');
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html).toContain('data-layout="slide"');
  });

  it('draws a slide that runs without stopping as two copies, hiding the second from readers', () => {
    const html = render({
      layout: 'slide',
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      slide: { motion: 'smooth', autoplay: true, interval: 5, dots: 'none', arrows: false },
    });
    expect(html).toContain('collection-marquee');
    expect(html.match(/collection-marquee-group/g)).toHaveLength(2);
    // 4 items twice; the duplicates are hidden from screen readers
    expect(html.match(/<li/g)).toHaveLength(8);
    expect(html.match(/aria-hidden="true"/g)?.length).toBeGreaterThanOrEqual(4);
    // 5 seconds per item for 4 items
    expect(html).toContain('--duration:20s');
  });

  it('turns a running slide into a normal slide when moving is switched off', () => {
    const html = render({
      layout: 'slide',
      slide: { motion: 'smooth', autoplay: false, dots: 'dot', arrows: true },
    });
    expect(html).toContain('collection-slider');
    expect(html).not.toContain('collection-marquee');
  });

  it('draws nothing for an empty list, and falls back to the default for nonsense settings', () => {
    expect(
      renderToStaticMarkup(React.createElement(Collection, { items: [], renderItem: () => null })),
    ).toBe('');
    expect(render({ layout: 'carousel', columns: { mobile: 99 } })).toContain('collection-grid');
  });

  it('caps grid items at 2 rows and renders show more button when items exceed limit', () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({ id: i, name: `Mục ${i + 1}` }));
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Collection, {
          items: manyItems,
          display: {
            layout: 'grid',
            columns: { mobile: 1, tablet: 2, desktop: 3 },
            showMore: { enabled: true, type: 'expand', maxRows: 2 },
          },
          label: 'Danh sách nhiều mục',
          renderItem: (item, _index, { layout }) =>
            React.createElement('div', { 'data-layout': layout }, item.name),
        }),
      ),
    );
    // 3 columns * 2 rows = 6 items shown initially
    expect(html.match(/<li/g)).toHaveLength(6);
    expect(html).toContain('Xem thêm');
    expect(html).toContain('4 mục');
  });

  it('renders link button when showMore type is link with seeAllHref', () => {
    const manyItems = Array.from({ length: 8 }, (_, i) => ({ id: i, name: `Mục ${i + 1}` }));
    const html = renderToStaticMarkup(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Collection, {
          items: manyItems,
          seeAllHref: '/products',
          display: {
            layout: 'grid',
            columns: { mobile: 1, tablet: 2, desktop: 2 },
            showMore: { enabled: true, type: 'link', maxRows: 2 },
          },
          label: 'Danh sách liên kết',
          renderItem: (item, _index, { layout }) =>
            React.createElement('div', { 'data-layout': layout }, item.name),
        }),
      ),
    );
    // 2 columns * 2 rows = 4 items
    expect(html.match(/<li/g)).toHaveLength(4);
    expect(html).toContain('href="/products"');
  });
});

describe('SliderDots', () => {
  const label = (current, total) => `Trang ${current}/${total}`;
  const draw = props =>
    renderToStaticMarkup(
      React.createElement(SliderDots, {
        pages: 4,
        page: 1,
        onSelect() {},
        label,
        running: true,
        ...props,
      }),
    );

  it('shows nothing when dots are off or there is only one page', () => {
    expect(draw({ style: 'none' })).toBe('');
    expect(draw({ style: 'dot', pages: 1 })).toBe('');
  });

  it('keeps room for the dots before the slider has measured itself', () => {
    const html = draw({ style: 'dot', pages: 0, count: 6 });
    expect(html).toContain('slider-dots--pending');
    expect(html).toContain('--items:6');
    expect(html).not.toContain('<button');
    // dots that are turned off never take room
    expect(draw({ style: 'none', pages: 0, count: 6 })).toBe('');
  });

  it('draws plain dots, marking the current one', () => {
    const html = draw({ style: 'dot' });
    expect(html).toContain('slider-dots--dot');
    expect(html.match(/<button/g)).toHaveLength(4);
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Trang 2/4"');
    // earlier pages, the current page and later pages are told apart for the CSS
    expect(html.match(/data-state="done"/g)).toHaveLength(1);
    expect(html.match(/data-state="active"/g)).toHaveLength(1);
    expect(html.match(/data-state="todo"/g)).toHaveLength(2);
  });

  it('puts every mark in one row, so the row is centred as a single box', () => {
    for (const style of ['dot', 'progress', 'slide']) {
      const html = draw({ style });
      expect(html.match(/slider-dots-row/g)).toHaveLength(1);
      expect(html.match(/slider-dots-mark/g)).toHaveLength(4);
    }
  });

  it('draws progress bars, each with a fill the slider can grow', () => {
    const html = draw({ style: 'progress' });
    expect(html).toContain('slider-dots--progress');
    expect(html.match(/slider-dots-fill/g)).toHaveLength(4);
    expect(html).toContain('data-running="true"');
    expect(draw({ style: 'progress', running: false })).toContain('data-running="false"');
    // the fill of a bar is drawn by the CSS from the page state; nothing is baked into the markup
    expect(html).not.toContain('scaleX');
  });

  it('does not draw bar fills for the other kinds', () => {
    expect(draw({ style: 'dot' })).not.toContain('slider-dots-fill');
    expect(draw({ style: 'slide' })).not.toContain('slider-dots-fill');
  });

  it('draws a gliding pill inside the row, after the dots, sitting on the current page', () => {
    const html = draw({ style: 'slide', page: 2 });
    expect(html).toContain('slider-dots--slide');
    expect(html.match(/slider-dots-thumb/g)).toHaveLength(1);
    expect(html).toContain('--index:2');
    // the pill is drawn after the buttons so it paints on top of them, and before the row ends
    expect(html.lastIndexOf('</button>')).toBeLessThan(html.indexOf('slider-dots-thumb'));
    expect(html.indexOf('slider-dots-thumb')).toBeLessThan(html.lastIndexOf('</div>'));
    expect(draw({ style: 'dot', page: 2 })).not.toContain('slider-dots-thumb');
  });

  it('shows a counter instead of dots when there are too many pages for a row', () => {
    const html = draw({ style: 'slide', pages: MAX_DOTS + 5, page: 3 });
    expect(html).toContain(`4 / ${MAX_DOTS + 5}`);
    expect(html).not.toContain('<button');
    expect(draw({ style: 'slide', pages: MAX_DOTS, page: 3 })).toContain('<button');
  });
});
