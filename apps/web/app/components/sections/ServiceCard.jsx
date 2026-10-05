import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { iconFor } from '../../lib/icons.js';
import { resizedImage } from '../../lib/images.js';

/** One of the service groups. Image, icon and the points shown all come from the admin. */
export function ServiceCard({ service, prefix, t }) {
  const Icon = iconFor(service.icon);
  const features = (service.features || []).slice(0, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:border-primary/50 hover:shadow-md">
      {service.image?.url && (
        <img
          src={resizedImage(service.image.url, 720)}
          alt={service.image.alt || ''}
          width={service.image.width || 720}
          height={service.image.height || 405}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {service.billing && (
            <span className="rounded-full border border-border-subtle bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-fg-muted">
              {t(`services.billing.${service.billing}`)}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-display text-lg font-bold text-fg">{service.name}</h3>
          {service.shortDescription && (
            <p className="text-sm leading-relaxed text-fg-muted">{service.shortDescription}</p>
          )}
        </div>

        {features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-fg-muted">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{feature.title}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto border-t border-border-subtle pt-4">
          <Link
            to={`${prefix}/services/${service.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            {t('common.viewDetails')}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
