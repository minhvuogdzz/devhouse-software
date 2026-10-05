import { describe, it, expect } from 'vitest';
import { isCurrentNavItem } from './AdminShell.jsx';

const pages = { to: '/pages', except: ['/pages/home', '/pages/about', '/pages/contact'] };
const home = { to: '/pages/home' };
const about = { to: '/pages/about' };
const blog = { to: '/blog', except: ['/blog/tags', '/blog/authors'] };
const tags = { to: '/blog/tags' };
const categories = { to: '/categories/product-segment', activeFor: '/categories' };

describe('sidebar highlight', () => {
  it('highlights only the entry for the screen shown', () => {
    expect(isCurrentNavItem(about, '/pages/about')).toBe(true);
    expect(isCurrentNavItem(pages, '/pages/about')).toBe(false);
    expect(isCurrentNavItem(pages, '/pages')).toBe(true);
    expect(isCurrentNavItem(home, '/pages/home')).toBe(true);
    expect(isCurrentNavItem(pages, '/pages/home')).toBe(false);
    expect(isCurrentNavItem(pages, '/pages/privacy')).toBe(true);
    expect(isCurrentNavItem(pages, '/pages/contact')).toBe(false);
  });

  it('keeps the blog entry for its own screens but not for tags or authors', () => {
    expect(isCurrentNavItem(blog, '/blog')).toBe(true);
    expect(isCurrentNavItem(blog, '/blog/6ac3550b')).toBe(true);
    expect(isCurrentNavItem(blog, '/blog/tags')).toBe(false);
    expect(isCurrentNavItem(tags, '/blog/tags')).toBe(true);
  });

  it('does not mistake a longer name for the same entry', () => {
    expect(isCurrentNavItem({ to: '/services' }, '/solutions')).toBe(false);
    expect(isCurrentNavItem({ to: '/projects' }, '/products')).toBe(false);
  });

  it('keeps the categories entry lit on every category tab', () => {
    expect(isCurrentNavItem(categories, '/categories/product-segment')).toBe(true);
    expect(isCurrentNavItem(categories, '/categories/project')).toBe(true);
    expect(isCurrentNavItem(categories, '/categories/technology')).toBe(true);
  });
});
