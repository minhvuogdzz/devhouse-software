import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Sun, Moon, Menu, X, Globe } from 'lucide-react';
import { useTheme } from '../../lib/theme.js';
import { getTranslation, getLocaleFromUrl, getAlternateLocalePath } from '../../lib/i18n.js';
import { Button } from '../ui/Button.jsx';
import { Logo } from '../ui/Logo.jsx';

export function Header({ alternateUrl = null }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);
  const t = getTranslation(locale);
  const { resolvedTheme, toggleTheme } = useTheme();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map(item => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== prefix && location.pathname.startsWith(`${item.path}/`));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'text-primary bg-primary-subtle font-semibold'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-2'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Controls: Theme + Language + CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Switch */}
          <Link
            to={langSwitchPath}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-border text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
            title={t('header.language')}
            aria-label={t('header.language')}
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <span className={locale === 'vi' ? 'text-primary font-bold' : ''}>VI</span>
            <span className="text-fg-subtle">/</span>
            <span className={locale === 'en' ? 'text-primary font-bold' : ''}>EN</span>
          </Link>

          {/* Theme Switch */}
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

          {/* Contact CTA */}
          <Button to={`${prefix}/contact`} size="sm" variant="primary">
            {t('header.contactCta')}
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            to={langSwitchPath}
            className="px-2 py-1 text-xs font-bold border border-border rounded text-primary"
            aria-label={t('header.language')}
          >
            {locale === 'vi' ? 'EN' : 'VI'}
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded border border-border text-fg"
            aria-label={t('header.theme')}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-warning" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-fg hover:bg-surface-2 rounded-md"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-border bg-surface px-4 pt-2 pb-6 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium rounded-md text-fg hover:bg-surface-2"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-border">
            <Button
              to={`${prefix}/contact`}
              className="w-full"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('header.contactCta')}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
