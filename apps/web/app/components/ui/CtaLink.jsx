import React from 'react';
import { Button } from './Button.jsx';
import { isExternalUrl, withLocale } from '../../lib/navigation.js';

/**
 * A button for a link field from the admin ({ label, url, target }).
 * Our own pages get the language prefix; outside links open as a normal link.
 */
export function CtaLink({ link, locale, fallbackUrl = '/contact', children, ...props }) {
  if (!link) return null;
  const url = link.url || fallbackUrl;
  const label = children ?? link.label;
  if (!label) return null;

  if (isExternalUrl(url)) {
    const newTab = link.target === '_blank';
    return (
      <Button
        href={url}
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {label}
      </Button>
    );
  }
  return (
    <Button to={withLocale(url, locale)} {...props}>
      {label}
    </Button>
  );
}
