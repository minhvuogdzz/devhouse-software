import React, { useState, useEffect } from 'react';
import { generateSeoMeta } from '../lib/seo.js';
import {
  useLoaderData,
  useActionData,
  useNavigation,
  useRouteLoaderData,
  Form,
} from 'react-router';
import { defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { getLocaleFromUrl, getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export async function loader({ request }) {
  const page = await loadPage('contact', request);
  const { locale } = page;
  const interest = (new URL(request.url).searchParams.get('interest') || '').slice(0, 150);

  const services = await loadList(
    `/services?limit=50&locale=${locale}`,
    defaultCatalog.services.map(item => localize(item, locale)),
  );

  return { ...page, services, interest, mountTime: Date.now() };
}

export async function action({ request }) {
  const formData = await request.formData();
  const locale = getLocaleFromUrl(request.url);

  const payload = {
    name: formData.get('name')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    company: formData.get('company')?.toString().trim() || '',
    service: formData.get('service')?.toString().trim() || '',
    subject: formData.get('interest')?.toString().trim().slice(0, 150) || '',
    timeline: formData.get('timeline')?.toString().trim() || '',
    message: formData.get('message')?.toString().trim() || '',
    locale,
    _hp: formData.get('_hp')?.toString() || '',
    _t: Number(formData.get('_t')) || Date.now() - 3000,
  };

  try {
    await apiClient('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      details: err.details || null,
    };
  }
}

export function meta({ data }) {
  return generateSeoMeta({
    title: data?.seo?.title || 'Dev House Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
  });
}

export default function ContactPage() {
  const { sections, services, interest, locale, mountTime } = useLoaderData();
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};
  const phoneHref = (settings.hotline || '').replace(/[^+\d]/g, '');
  const actionData = useActionData();
  const navigation = useNavigation();
  const t = getTranslation(locale);
  const hero = sections.hero;

  const [clientTimestamp, setClientTimestamp] = useState(mountTime);
  useEffect(() => {
    setClientTimestamp(Date.now());
  }, []);

  const isSubmitting = navigation.state === 'submitting';
  const isSuccess = actionData?.success;

  const timelineOptions = ['urgent', 'oneMonth', 'threeMonths', 'exploring'].map(key => ({
    value: key,
    label: t(`contact.timelineOptions.${key}`),
  }));

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors';

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        {isShown(hero) && (
          <div className="max-w-3xl space-y-4">
            <Badge variant="default">{hero.eyebrow || t('header.nav.contact')}</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
              {hero.heading}
            </h1>
            <p className="text-lg text-fg-muted leading-relaxed">{hero.subheading}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7">
            <Card hover={false} className="p-6 sm:p-8">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4" role="status">
                  <div className="w-16 h-16 rounded-full bg-success-subtle text-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                  </div>
                  <h2 className="text-2xl font-bold font-display text-fg">
                    {t('contact.successTitle')}
                  </h2>
                  <p className="text-fg-muted max-w-md mx-auto text-sm leading-relaxed">
                    {t('contact.successDesc')}
                  </p>
                </div>
              ) : (
                <Form method="post" className="space-y-6">
                  {/* Anti-spam honeypot */}
                  <div style={{ display: 'none' }} aria-hidden="true">
                    <label htmlFor="_hp">Leave this empty</label>
                    <input type="text" id="_hp" name="_hp" tabIndex="-1" autoComplete="off" />
                    <input type="hidden" name="_t" value={clientTimestamp} />
                  </div>

                  {actionData?.error && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl bg-danger-subtle text-danger border border-danger/20 flex items-start gap-3 text-sm"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">{t('contact.errorDesc')}</p>
                        <p className="text-xs mt-1">{actionData.error}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-semibold text-fg">
                        {t('contact.name')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        autoComplete="name"
                        className={inputClass}
                        placeholder={t('contact.placeholders.name')}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-fg">
                        {t('contact.email')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        autoComplete="email"
                        className={inputClass}
                        placeholder={t('contact.placeholders.email')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-semibold text-fg">
                        {t('contact.phone')}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        autoComplete="tel"
                        className={inputClass}
                        placeholder={t('contact.placeholders.phone')}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-sm font-semibold text-fg">
                        {t('contact.company')}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        autoComplete="organization"
                        className={inputClass}
                        placeholder={t('contact.placeholders.company')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="interest" className="block text-sm font-semibold text-fg">
                      {t('contact.interest')}
                    </label>
                    <input
                      type="text"
                      id="interest"
                      name="interest"
                      maxLength={150}
                      defaultValue={interest}
                      className={inputClass}
                      placeholder={t('contact.placeholders.interest')}
                    />
                    <p className="text-xs text-fg-subtle">{t('contact.interestHint')}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="service" className="block text-sm font-semibold text-fg">
                        {t('contact.service')}
                      </label>
                      <select id="service" name="service" className={inputClass}>
                        <option value="">{t('contact.selectService')}</option>
                        {services.map(s => (
                          <option key={s._id || s.slug} value={s._id || s.slug}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="timeline" className="block text-sm font-semibold text-fg">
                        {t('contact.timeline')}
                      </label>
                      <select id="timeline" name="timeline" className={inputClass}>
                        <option value="">{t('contact.selectTimeline')}</option>
                        {timelineOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-semibold text-fg">
                      {t('contact.message')} <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      minLength={10}
                      className={inputClass}
                      placeholder={t('contact.placeholders.message')}
                    />
                    <p className="text-xs text-fg-subtle">{t('contact.messageHint')}</p>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      t('contact.submitting')
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" aria-hidden="true" />
                        {t('contact.submit')}
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </Card>
          </div>

          {/* Contact information column: details come from Admin → Settings */}
          <div className="lg:col-span-5 space-y-6">
            <Card hover={false} className="space-y-6 p-6 sm:p-8">
              <h2 className="text-xl font-bold font-display text-fg">{t('contact.directTitle')}</h2>

              <ul className="space-y-4 text-sm text-fg-muted">
                {settings.contactEmail && (
                  <li className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="block font-semibold text-fg">{t('contact.emailLabel')}</span>
                      <a
                        href={`mailto:${settings.contactEmail}`}
                        className="hover:text-primary transition-colors"
                      >
                        {settings.contactEmail}
                      </a>
                    </div>
                  </li>
                )}

                {settings.hotline && (
                  <li className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="block font-semibold text-fg">
                        {t('contact.hotlineLabel')}
                      </span>
                      <a href={`tel:${phoneHref}`} className="hover:text-primary transition-colors">
                        {settings.hotline}
                      </a>
                    </div>
                  </li>
                )}

                {settings.address && (
                  <li className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="block font-semibold text-fg">
                        {t('contact.addressLabel')}
                      </span>
                      <p className="leading-relaxed">{settings.address}</p>
                    </div>
                  </li>
                )}

                {settings.workingHours && (
                  <li className="flex items-start gap-3">
                    <span className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <div>
                      <span className="block font-semibold text-fg">{t('contact.hoursLabel')}</span>
                      <p className="leading-relaxed">{settings.workingHours}</p>
                    </div>
                  </li>
                )}
              </ul>
            </Card>

            <div className="rounded-2xl bg-surface-raised border border-border p-6 space-y-3">
              <h3 className="text-base font-bold font-display text-fg">{t('contact.noteTitle')}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{t('contact.noteText')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
