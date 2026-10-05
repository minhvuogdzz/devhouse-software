import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Collection } from '../app/components/ui/Collection.jsx';
import { SliderDots } from '../app/components/ui/SliderDots.jsx';

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

  it('draws plain dots, marking the current one', () => {
    const html = draw({ style: 'dot' });
    expect(html).toContain('slider-dots--dot');
    expect(html.match(/<button/g)).toHaveLength(4);
    expect(html.match(/aria-current="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Trang 2/4"');
  });

  it('draws progress bars: earlier pages full, later pages empty', () => {
    const html = draw({ style: 'progress' });
    expect(html).toContain('slider-dots--progress');
    expect(html.match(/transform:scaleX\(1\)/g)).toHaveLength(1);
    expect(html.match(/transform:scaleX\(0\)/g)).toHaveLength(3);
  });

  it('draws a gliding pill that sits on the current page', () => {
    const html = draw({ style: 'slide', page: 2 });
    expect(html).toContain('slider-dots--slide');
    expect(html).toContain('slider-dots-thumb');
    expect(html).toContain('--index:2');
  });
});
