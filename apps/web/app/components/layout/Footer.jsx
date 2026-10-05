import React from 'react';
import { Link, useLocation, useRouteLoaderData } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';
import { getTranslation, getLocaleFromUrl } from '../../lib/i18n.js';
import { isExternalUrl, resolveNavigation, withLocale } from '../../lib/navigation.js';

const linkClass = 'text-fg-muted hover:text-primary transition-colors';

function FooterLink({ link, locale, className = linkClass }) {
  const path = withLocale(link.path, locale);
  if (isExternalUrl(link.path)) {
    return (
      <a href={path} className={className} rel="noopener noreferrer">
        {link.label}
      </a>
    );
  }
  return (
    <Link to={path} className={className}>
      {link.label}
    </Link>
  );
}

export function Footer() {
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';
  const currentYear = new Date().getFullYear();
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};
  const { columns } = resolveNavigation(site, locale);
  const phoneHref = (settings.hotline || '').replace(/[^+\d]/g, '');

  return (
    <footer className="border-t border-border bg-surface text-fg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Company */}
          <div className="space-y-4 lg:w-80 lg:shrink-0">
            <Link to={prefix || '/'} className="inline-block" aria-label="Dev House Software">
              <Logo variant="full" alt="Dev House Software" className="h-28 w-auto" />
            </Link>
            {settings.tagline && (
              <p className="text-sm text-fg-muted leading-relaxed max-w-sm">{settings.tagline}</p>
            )}
            <ul className="pt-2 text-sm text-fg-muted space-y-2">
              {settings.contactEmail && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="hover:text-primary transition-colors"
                  >
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.hotline && (
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                  <a href={`tel:${phoneHref}`} className="hover:text-primary transition-colors">
                    {settings.hotline}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Link columns, managed in Admin → Navigation */}
          {columns.length > 0 && (
            <div
              className="grid flex-1 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
              style={{ '--cols': columns.length }}
            >
              {columns.map((column, index) => (
                <nav key={`${column.title}-${index}`} aria-label={column.title}>
                  <h2 className="text-sm font-semibold text-fg mb-4">{column.title}</h2>
                  <ul className="space-y-2.5 text-sm">
                    {column.links.map(link => (
                      <li key={`${link.path}-${link.label}`}>
                        <FooterLink link={link} locale={locale} />
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-fg-subtle gap-4">
          <p>{t('footer.copyright').replace('{year}', String(currentYear))}</p>
          <div className="flex gap-6">
            <Link to={`${prefix}/privacy`} className="hover:text-fg transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to={`${prefix}/terms`} className="hover:text-fg transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
