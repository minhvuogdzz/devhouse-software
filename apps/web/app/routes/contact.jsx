import React, { useState, useEffect } from 'react';
import {
  useLoaderData,
  useActionData,
  useNavigation,
  useRouteLoaderData,
  Form,
} from 'react-router';
import { defaultPages, defaultCatalog, localize } from '@devhouse/content';
import { apiClient } from '../lib/api-client.js';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export async function loader({ request }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  let pageData = null;
  let services = [];
  let siteSettings = null;

  try {
    const res = await apiClient(`/pages/contact?locale=${locale}`);
    pageData = res.data?.resolved || res.data;
  } catch {
    pageData = defaultPages['contact'] || {};
  }

  try {
    const sRes = await apiClient(`/services?limit=50&locale=${locale}`);
    services = sRes.data || [];
  } catch {
    services = defaultCatalog.services ? defaultCatalog.services.map(s => localize(s, locale)) : [];
  }

  try {
    const siteRes = await apiClient(`/site?locale=${locale}`);
    siteSettings = siteRes.data || null;
  } catch {
    siteSettings = null;
  }

  return {
    pageData: localize(pageData, locale),
    services,
    siteSettings,
    locale,
    mountTime: Date.now(),
  };
}

export async function action({ request }) {
  const formData = await request.formData();
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';

  const payload = {
    name: formData.get('name')?.toString().trim() || '',
    email: formData.get('email')?.toString().trim() || '',
    phone: formData.get('phone')?.toString().trim() || '',
    company: formData.get('company')?.toString().trim() || '',
    service: formData.get('service')?.toString().trim() || '',
    budget: formData.get('budget')?.toString().trim() || '',
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
      error: err.message || (locale === 'en' ? 'Submission failed' : 'Gửi yêu cầu thất bại'),
      details: err.details || null,
    };
  }
}

export function meta({ data }) {
  const isEn = data?.locale === 'en';
  return [
    {
      title: isEn
        ? 'Contact Our Technical Team — Dev House Software'
        : 'Liên hệ Tư vấn Phần mềm Doanh nghiệp — Dev House Software',
    },
    {
      name: 'description',
      content: isEn
        ? 'Connect with Dev House Software to evaluate project feasibility, architecture, and timeline.'
        : 'Liên hệ đội ngũ Dev House để được phân tích yêu cầu, tư vấn kiến trúc và dự toán kinh phí triển khai.',
    },
  ];
}

export default function ContactPage() {
  const { pageData, services, locale, mountTime } = useLoaderData();
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};
  const phoneHref = (settings.hotline || '').replace(/[^+\d]/g, '');
  const actionData = useActionData();
  const navigation = useNavigation();
  const t = getTranslation(locale);

  const [clientTimestamp, setClientTimestamp] = useState(mountTime);
  useEffect(() => {
    setClientTimestamp(Date.now());
  }, []);

  const isSubmitting = navigation.state === 'submitting';
  const isSuccess = actionData?.success;

  const hero = pageData.sections?.hero ||
    defaultPages['contact']?.defaults?.hero || {
      heading:
        locale === 'en'
          ? 'Let’s discuss your upcoming software goals and challenges'
          : 'Thảo luận về bài toán và lộ trình công nghệ của doanh nghiệp bạn',
      subheading:
        locale === 'en'
          ? 'Share your business context or project scope with us. We will respond promptly within one working day.'
          : 'Chúng tôi sẵn sàng lắng nghe, tư vấn phương án kỹ thuật phù hợp và hỗ trợ bạn dự toán chi phí triển khai tối ưu.',
    };

  const budgetOptions =
    locale === 'en'
      ? [
          { value: 'under-10k', label: 'Under $10,000 USD' },
          { value: '10k-25k', label: '$10,000 – $25,000 USD' },
          { value: '25k-50k', label: '$25,000 – $50,000 USD' },
          { value: 'over-50k', label: 'Over $50,000 USD' },
        ]
      : [
          { value: 'under-200m', label: 'Dưới 200 triệu VNĐ' },
          { value: '200m-500m', label: '200 triệu – 500 triệu VNĐ' },
          { value: '500m-1b', label: '500 triệu – 1 tỷ VNĐ' },
          { value: 'over-1b', label: 'Trên 1 tỷ VNĐ' },
        ];

  const timelineOptions =
    locale === 'en'
      ? [
          { value: 'urgent', label: 'Urgent (Within 1 month)' },
          { value: '1-3-months', label: '1 to 3 months' },
          { value: '3-6-months', label: '3 to 6 months' },
          { value: 'planning', label: 'Long-term planning' },
        ]
      : [
          { value: 'urgent', label: 'Khẩn cấp (Trong vòng 1 tháng)' },
          { value: '1-3-months', label: '1 đến 3 tháng' },
          { value: '3-6-months', label: '3 đến 6 tháng' },
          { value: 'planning', label: 'Giai đoạn lập kế hoạch' },
        ];

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="default">{t('header.nav.contact')}</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight leading-tight">
            {hero.heading}
          </h1>
          <p className="text-lg text-fg-muted leading-relaxed">{hero.subheading}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-success-subtle text-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
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
                    <div className="p-4 rounded-xl bg-danger-subtle text-danger border border-danger/20 flex items-start gap-3 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
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
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                        placeholder={locale === 'en' ? 'e.g. Jane Doe' : 'Ví dụ: Nguyễn Văn A'}
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
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                        placeholder={locale === 'en' ? 'jane@company.com' : 'nguyen@congty.com'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="company" className="block text-sm font-semibold text-fg">
                        {t('contact.company')}
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                        placeholder={locale === 'en' ? 'e.g. Acme Corp' : 'Tên công ty'}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-semibold text-fg">
                        {t('contact.phone')}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                        placeholder={locale === 'en' ? '+1 (555) 000-0000' : '0912 345 678'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2 sm:col-span-1">
                      <label htmlFor="service" className="block text-sm font-semibold text-fg">
                        {t('contact.service')}
                      </label>
                      <select
                        id="service"
                        name="service"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                      >
                        <option value="">{t('contact.selectService')}</option>
                        {services.map(s => {
                          const title = s.name || s.title;
                          return (
                            <option key={s._id || s.slug} value={s.slug}>
                              {title}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-1">
                      <label htmlFor="budget" className="block text-sm font-semibold text-fg">
                        {t('contact.budget')}
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                      >
                        <option value="">{t('contact.selectBudget')}</option>
                        {budgetOptions.map(b => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-1">
                      <label htmlFor="timeline" className="block text-sm font-semibold text-fg">
                        {t('contact.timeline')}
                      </label>
                      <select
                        id="timeline"
                        name="timeline"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                      >
                        <option value="">{t('contact.selectTimeline')}</option>
                        {timelineOptions.map(tl => (
                          <option key={tl.value} value={tl.value}>
                            {tl.label}
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-colors"
                      placeholder={
                        locale === 'en'
                          ? 'Please provide an overview of your requirements, current pain points, and target launch window...'
                          : 'Vui lòng mô tả tổng quan về nhu cầu dự án, bài toán vận hành hiện tại hoặc tiến độ mong muốn...'
                      }
                    />
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
                        <Send className="w-4 h-4 mr-2" />
                        {t('contact.submit')}
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </Card>
          </div>

          {/* Contact Information Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="space-y-6 p-6 sm:p-8">
              <h2 className="text-xl font-bold font-display text-fg">
                {locale === 'en' ? 'Direct Communication' : 'Kênh Liên hệ Trực tiếp'}
              </h2>

              <div className="space-y-4 text-sm text-fg-muted">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-semibold text-fg">Email</span>
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="hover:text-primary transition-colors"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-semibold text-fg">
                      {locale === 'en' ? 'Hotline' : 'Đường dây nóng'}
                    </span>
                    <a href={`tel:${phoneHref}`} className="hover:text-primary transition-colors">
                      {settings.hotline}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-semibold text-fg">
                      {locale === 'en' ? 'Headquarters' : 'Văn phòng làm việc'}
                    </span>
                    <p className="leading-relaxed">Dev House Software, {settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-subtle text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-semibold text-fg">
                      {locale === 'en' ? 'Working Hours' : 'Thời gian làm việc'}
                    </span>
                    <p className="leading-relaxed">
                      {locale === 'en'
                        ? 'Monday – Friday: 08:30 – 18:00 (GMT+7)'
                        : 'Thứ Hai – Thứ Sáu: 08:30 – 18:00 (GMT+7)'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Response Commitment Box */}
            <div className="rounded-2xl bg-surface-raised border border-border p-6 space-y-3">
              <h3 className="text-base font-bold font-display text-fg">
                {locale === 'en' ? 'Our Service Commitment' : 'Cam kết Phản hồi'}
              </h3>
              <p className="text-sm text-fg-muted leading-relaxed">
                {locale === 'en'
                  ? 'All inquiries are reviewed directly by our technical leads. We sign Non-Disclosure Agreements (NDA) upon request before discussing proprietary details.'
                  : 'Mọi yêu cầu đều được xem xét trực tiếp bởi các kỹ sư phụ trách chính. Chúng tôi sẵn sàng ký thỏa thuận bảo mật thông tin (NDA) trước khi đi sâu vào chi tiết dự án.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
