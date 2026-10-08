import React from 'react';
import { Link, useLocation, useRouteLoaderData } from 'react-router';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';
import { SocialIcon } from '../ui/SocialIcons.jsx';
import { getTranslation, getLocaleFromUrl } from '../../lib/i18n.js';
import { isExternalUrl, resolveNavigation, withLocale } from '../../lib/navigation.js';

const linkClass = 'text-fg-muted hover:text-primary transition-colors';

const DEFAULT_FOOTER_SOCIALS = [
  { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/devhousesoftware', enabled: true },
  { platform: 'zalo', label: 'Zalo', url: 'https://zalo.me/0869528304', enabled: true },
  { platform: 'telegram', label: 'Telegram', url: 'https://t.me/devhousesoftware', enabled: true },
  { platform: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/@devhousesoftware', enabled: true },
  { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@devhousesoftware', enabled: true },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/devhousesoftware', enabled: true },
  { platform: 'github', label: 'GitHub', url: 'https://github.com/thedevhouse', enabled: true },
];

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

  const rawSocials = Array.isArray(settings.socialLinks) && settings.socialLinks.length > 0
    ? settings.socialLinks
    : DEFAULT_FOOTER_SOCIALS;

  const socialLinks = rawSocials.filter(s => s && s.enabled !== false && s.url);

  return (
    <footer id="site-footer" className="border-t border-border bg-surface text-fg transition-colors">
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

        {/* Social channels section */}
        {socialLinks.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-fg">
                  {locale === 'en' ? 'Official Social Channels' : 'Kênh mạng xã hội chính thức'}
                </h3>
                <p className="text-xs text-fg-muted mt-0.5">
                  {locale === 'en'
                    ? 'Connect with Dev House Software across our verified networks.'
                    : 'Kết nối và theo dõi Dev House Software trên các kênh truyền thông chính thức.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {socialLinks.map((item, idx) => (
                  <a
                    key={`${item.platform}-${idx}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label || item.platform}
                    title={item.label || item.platform}
                    className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface-raised hover:bg-surface-2 hover:border-primary/40 text-fg-muted hover:text-primary transition-all duration-200 text-xs font-medium shadow-2xs hover:shadow-xs hover:-translate-y-0.5"
                  >
                    <SocialIcon platform={item.platform} className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="capitalize">{item.label || item.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-fg-subtle gap-4">
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
