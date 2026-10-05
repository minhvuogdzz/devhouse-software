import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { X, Monitor, Tablet, Smartphone, Loader2, MessageCircle } from 'lucide-react';

const DEVICES = [
  { id: 'desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', icon: Smartphone, width: '390px' },
];

const FOCUSABLE = 'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

/**
 * Shows a demo page inside the site (an iframe in a dialog), so visitors never leave the page.
 * The frame is sandboxed: it can run scripts and use forms, but cannot navigate our page away.
 */
export function DemoModal({ product, t, contactHref, onClose }) {
  const [device, setDevice] = useState('desktop');
  const [loaded, setLoaded] = useState(false);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    openerRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
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
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      openerRef.current?.focus?.();
    };
  }, [onClose]);

  const width = DEVICES.find(d => d.id === device)?.width || '100%';

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center sm:p-4">
      <div className="absolute inset-0 bg-scrim/80 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('products.demoTitle').replace('{name}', product.name)}
        className="relative z-10 flex w-full max-w-7xl flex-col overflow-hidden bg-surface sm:rounded-lg sm:border sm:border-border"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2 sm:px-4">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-fg">{product.name}</p>
            {product.category?.name && (
              <p className="truncate text-xs text-fg-muted">{product.category.name}</p>
            )}
          </div>

          <div
            className="hidden items-center gap-1 rounded-md bg-surface-2 p-0.5 md:flex"
            role="group"
            aria-label={t('products.device')}
          >
            {DEVICES.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setDevice(id)}
                aria-pressed={device === id}
                aria-label={t(`products.devices.${id}`)}
                title={t(`products.devices.${id}`)}
                className={`rounded p-1.5 transition-colors cursor-pointer ${
                  device === id
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {contactHref && (
              <Link
                to={contactHref}
                onClick={onClose}
                className="hidden items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg hover:bg-primary-hover sm:inline-flex"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {t('products.consult')}
              </Link>
            )}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t('products.close')}
              className="rounded-md p-1.5 text-fg-muted hover:bg-surface-2 hover:text-fg cursor-pointer"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 justify-center bg-surface-2">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-fg-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t('products.loadingDemo')}
            </div>
          )}
          <iframe
            title={t('products.demoTitle').replace('{name}', product.name)}
            src={product.demoUrl}
            onLoad={() => setLoaded(true)}
            style={{ width, maxWidth: '100%' }}
            className="h-full min-h-[60vh] border-0 bg-surface transition-[width] duration-300 motion-reduce:transition-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock allow-presentation"
            allow="fullscreen; gamepad; autoplay; clipboard-write"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
          />
        </div>

        <p className="border-t border-border px-4 py-2 text-[11px] text-fg-subtle">
          {t('products.demoHint')}
        </p>
      </div>
    </div>
  );
}
