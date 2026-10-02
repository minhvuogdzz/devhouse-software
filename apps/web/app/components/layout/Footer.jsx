import React from 'react';
import { Link, useLocation, useRouteLoaderData } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';
import { getTranslation, getLocaleFromUrl } from '../../lib/i18n.js';

export function Footer() {
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';
  const currentYear = new Date().getFullYear();
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};
  const phoneHref = (settings.hotline || '').replace(/[^+\d]/g, '');

  return (
    <footer className="border-t border-border bg-surface text-fg transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Company Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to={prefix || '/'} className="inline-block" aria-label="Dev House Software">
              <Logo variant="full" alt="Dev House Software" className="h-28 w-auto" />
            </Link>
            <p className="text-sm text-fg-muted leading-relaxed max-w-sm">{t('footer.tagline')}</p>
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

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-fg tracking-wide uppercase mb-4">
              {t('footer.navigation')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to={`${prefix}/about`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('header.nav.about')}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/projects`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('header.nav.projects')}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/technologies`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('header.nav.technologies')}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/blog`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('header.nav.blog')}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/careers`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions & Services */}
          <div>
            <h4 className="text-sm font-semibold text-fg tracking-wide uppercase mb-4">
              {t('footer.solutions')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to={`${prefix}/services`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('header.nav.services')}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/solutions`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('header.nav.solutions')}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/contact`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('header.nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-fg tracking-wide uppercase mb-4">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to={`${prefix}/privacy`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  to={`${prefix}/terms`}
                  className="text-fg-muted hover:text-primary transition-colors"
                >
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-fg-subtle gap-4">
          <p>
            {t('footer.copyright').replace(
              'Dev House Software',
              `Dev House Software © ${currentYear}`,
            )}
          </p>
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
