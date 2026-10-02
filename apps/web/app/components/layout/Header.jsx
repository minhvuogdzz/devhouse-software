import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Sun, Moon, Menu, X, Globe } from 'lucide-react';
import { useTheme } from '../../lib/theme.js';
import { getTranslation, getLocaleFromUrl, getAlternateLocalePath } from '../../lib/i18n.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from '../ui/Logo.jsx';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Header({ alternateUrl = null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);
  const t = getTranslation(locale);
  const { resolvedTheme, toggleTheme } = useTheme();
  const openButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const drawerRef = useRef(null);

  const prefix = locale === 'en' ? '/en' : '';
  const homePath = prefix || '/';

  const navItems = [
    { label: t('header.nav.services'), path: `${prefix}/services` },
    { label: t('header.nav.solutions'), path: `${prefix}/solutions` },
    { label: t('header.nav.projects'), path: `${prefix}/projects` },
    { label: t('header.nav.technologies'), path: `${prefix}/technologies` },
    { label: t('header.nav.blog'), path: `${prefix}/blog` },
    { label: t('header.nav.about'), path: `${prefix}/about` },
    { label: t('header.nav.contact'), path: `${prefix}/contact` },
  ];

  // Target path for language switch
  const langSwitchPath = alternateUrl || getAlternateLocalePath(location.pathname);

  const isActive = path =>
    location.pathname === path || (path !== prefix && location.pathname.startsWith(`${path}/`));

  // Close the drawer whenever the page changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // While open: lock page scroll, close on Escape, keep Tab inside the drawer, restore focus after
  useEffect(() => {
    if (!menuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Wait a moment: the panel only becomes focusable once it starts sliding in
    const focusTimer = setTimeout(() => closeButtonRef.current?.focus(), 60);
    const opener = openButtonRef.current;

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawerRef.current) return;
      const items = drawerRef.current.querySelectorAll(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // Leaving desktop-size-down to desktop: close so the page is not left scroll-locked
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = e => e.matches && setMenuOpen(false);
    media.addEventListener('change', onChange);

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      media.removeEventListener('change', onChange);
      opener?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link to={homePath} className="flex items-center gap-3 group focus:outline-none">
            <Logo variant="mark" className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-tight text-fg group-hover:text-primary transition-colors">
                Dev House
              </span>
              <span className="text-[11px] font-medium text-fg-subtle -mt-1 tracking-wider uppercase">
                Software
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2"
            aria-label={t('header.menuLabel')}
          >
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'text-primary bg-primary-subtle font-semibold'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-2'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Controls: language, theme, CTA (from tablet up), menu button (below desktop) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to={langSwitchPath}
              className="sm:hidden px-2.5 py-2 rounded-md text-xs font-bold border border-border text-primary hover:bg-surface-2 transition-colors"
              title={t('header.language')}
              aria-label={t('header.language')}
            >
              {locale === 'vi' ? 'EN' : 'VI'}
            </Link>
            <Link
              to={langSwitchPath}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-border text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
              title={t('header.language')}
              aria-label={t('header.language')}
            >
              <Globe className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span className={locale === 'vi' ? 'text-primary font-bold' : ''}>VI</span>
              <span className="text-fg-subtle">/</span>
              <span className={locale === 'en' ? 'text-primary font-bold' : ''}>EN</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md border border-border text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
              title={t('header.theme')}
              aria-label={t('header.theme')}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-warning" />
              ) : (
                <Moon className="w-4 h-4 text-fg-muted" />
              )}
            </button>

            <Button
              to={`${prefix}/contact`}
              size="sm"
              variant="primary"
              className="hidden sm:inline-flex"
            >
              {t('header.contactCta')}
            </Button>

            <button
              ref={openButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 text-fg hover:bg-surface-2 rounded-md cursor-pointer"
              aria-label={t('header.menuOpen')}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet menu: slides in from the right.
          Rendered beside <header> (not inside it) because the header's blur would otherwise
          make `position: fixed` relative to the header instead of the screen. */}
      <div className="lg:hidden" aria-hidden={!menuOpen}>
        <div
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-[60] bg-fg/50 backdrop-blur-xs transition-opacity duration-300 motion-reduce:transition-none ${
            menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />
        <aside
          id="mobile-menu"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('header.menuLabel')}
          inert={menuOpen ? undefined : true}
          className={`fixed inset-y-0 right-0 z-[70] flex w-[86%] max-w-sm flex-col border-l border-border bg-surface shadow-2xl transition-[transform,visibility] duration-300 ease-out motion-reduce:transition-none ${
            menuOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
          }`}
        >
          <div className="flex h-18 shrink-0 items-center justify-between border-b border-border px-5">
            <Link to={homePath} className="flex items-center gap-3">
              <Logo variant="mark" className="h-9 w-auto" />
              <span className="font-display font-bold text-lg text-fg">Dev House</span>
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              className="p-2 rounded-md text-fg hover:bg-surface-2 cursor-pointer"
              aria-label={t('header.menuClose')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t('header.menuLabel')}>
            <ul className="space-y-1">
              {navItems.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`block rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-subtle text-primary font-semibold'
                        : 'text-fg hover:bg-surface-2'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="shrink-0 space-y-4 border-t border-border p-5">
            <Button to={`${prefix}/contact`} className="w-full">
              {t('header.contactCta')}
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
