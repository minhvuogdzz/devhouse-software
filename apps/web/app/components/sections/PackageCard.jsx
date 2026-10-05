import React from 'react';
import { Link } from 'react-router';
import { CheckCircle2, Headset } from 'lucide-react';

function money(value, currency, locale) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN', {
    style: 'currency',
    currency: currency || 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

const isNumber = value => typeof value === 'number' && Number.isFinite(value);

/**
 * A package. Prices are optional in the admin: until they are filled in the card says
 * "Contact us for a quote" instead of showing any number.
 */
export function PackageCard({ pack, locale, prefix, t }) {
  const hasSetup = isNumber(pack.setupFee);
  const hasRecurring = isNumber(pack.recurringFee);
  const period =
    pack.recurringPeriod === 'quarter' ? t('packages.perQuarter') : t('packages.perYear');
  const interest = encodeURIComponent(pack.name);

  return (
    <article
      className={`relative flex h-full flex-col gap-5 rounded-xl border bg-surface p-6 transition-shadow hover:shadow-md ${
        pack.isFeatured ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      }`}
    >
      {pack.isFeatured && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-fg">
          {t('packages.featured')}
        </span>
      )}

      <header className="space-y-2">
        <h3 className="font-display text-xl font-bold text-fg">{pack.name}</h3>
        {pack.audience && (
          <p className="text-sm font-medium text-primary">
            {t('packages.audience')}: {pack.audience}
          </p>
        )}
        {pack.shortDescription && (
          <p className="text-sm leading-relaxed text-fg-muted">{pack.shortDescription}</p>
        )}
      </header>

      <div className="rounded-lg bg-surface-2 p-4">
        {hasSetup || hasRecurring ? (
          <dl className="space-y-3">
            {hasSetup && (
              <div>
                <dt className="text-xs text-fg-subtle">{t('packages.setupFee')}</dt>
                <dd className="font-display text-lg font-bold text-fg">
                  {money(pack.setupFee, pack.currency, locale)}
                </dd>
              </div>
            )}
            {hasRecurring && (
              <div>
                <dt className="text-xs text-fg-subtle">{t('packages.recurringFee')}</dt>
                <dd className="font-display text-lg font-bold text-fg">
                  {money(pack.recurringFee, pack.currency, locale)}{' '}
                  <span className="text-sm font-medium text-fg-muted">{period}</span>
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="space-y-1">
            <p className="font-display text-lg font-bold text-fg">{t('packages.priceOnRequest')}</p>
            <p className="text-xs text-fg-subtle">{t('packages.priceOnRequestNote')}</p>
          </div>
        )}
        {pack.priceNote && <p className="mt-3 text-xs text-fg-muted">{pack.priceNote}</p>}
      </div>

      {pack.inclusions?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
            {t('packages.includes')}
          </h4>
          <ul className="space-y-2">
            {pack.inclusions.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-fg">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pack.supportHours && (
        <p className="flex items-start gap-2 text-sm text-fg-muted">
          <Headset className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            {t('packages.support')}: {pack.supportHours}
          </span>
        </p>
      )}

      <Link
        to={`${prefix}/contact?interest=${interest}`}
        className="mt-auto inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-fg shadow-sm transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {t('packages.choose')}
      </Link>
    </article>
  );
}
