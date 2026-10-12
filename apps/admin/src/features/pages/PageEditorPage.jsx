import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { RotateCcw, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';
import { diffSections, isEqual } from '../../lib/content-diff.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import { PATH_TO_HOME_SECTION, STATIC_SITE_PATHS } from '../../components/form/PathPickerInput.jsx';
import { SectionForm } from '../../components/content/SectionForm.jsx';
import { PageOverview } from '../../components/content/PageOverview.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Button } from '../../components/ui/Button.jsx';

const clone = value => JSON.parse(JSON.stringify(value ?? null));

function normalizePath(rawPath) {
  const trimmed = (rawPath || '').trim();
  if (!trimmed) return '';
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

// Tab that lists every section of a page with its on/off switch and display settings
const OVERVIEW_TAB = 'overview';

const PUBLIC_URL_MAP = {
  home: '/',
  about: '/about',
  'services-index': '/services',
  'packages-index': '/packages',
  'products-index': '/products',
  'solutions-index': '/solutions',
  'projects-index': '/projects',
  'technologies-index': '/technologies',
  'blog-index': '/blog',
  careers: '/careers',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',
};

export function friendlySectionLabel(sectionKey, rawLabel) {
  if (sectionKey === 'hero') return 'Đầu trang (Heading & Mô tả)';
  if (sectionKey === 'cta') return 'Khung kêu gọi / Liên hệ (/contact)';
  if (sectionKey === 'empty') return 'Khi chưa có dữ liệu';
  if (sectionKey === 'payment') return 'Cách thanh toán';
  if (sectionKey === 'commitments') return 'Cam kết dịch vụ';
  if (sectionKey === 'company') return 'Giới thiệu công ty';
  if (sectionKey === 'mission') return 'Giá trị cốt lõi';
  if (sectionKey === 'leadership') return 'Đội ngũ lãnh đạo';
  if (sectionKey === 'serviceTerms') return 'Điều khoản dịch vụ';
  return rawLabel || sectionKey;
}

export default function PageEditorPage() {
  const { key } = useParams();

  const [page, setPage] = useState(null);
  const [sections, setSections] = useState({});
  const [seo, setSeo] = useState({ title: { vi: '', en: '' }, description: { vi: '', en: '' } });
  const [navHeader, setNavHeader] = useState([]);
  const [activeTab, setActiveTab] = useState('seo');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadPage();
  }, [key]);

  const loadPage = async keepTab => {
    try {
      setIsLoading(true);
      const [res, navRes] = await Promise.all([
        apiClient(`/admin/pages/${key}`),
        key === 'home' ? apiClient('/admin/navigation/main').catch(() => null) : Promise.resolve(null),
      ]);
      const data = res.data;
      setPage(data);
      setSections(clone(data.resolved));
      setSeo(clone(data.seo) || { title: { vi: '', en: '' }, description: { vi: '', en: '' } });
      if (navRes?.data?.header) {
        setNavHeader(navRes.data.header);
      }
      const first = data.definition?.overview
        ? OVERVIEW_TAB
        : data.definition?.sections?.[0]?.key || 'seo';
      setActiveTab(current => (keepTab && current ? current : first));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể tải dữ liệu trang.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isNavPathFeatured = rawPath => {
    const path = normalizePath(rawPath);
    if (!path || path === '/') return true;
    const mappedSectionKey = PATH_TO_HOME_SECTION[path];
    if (mappedSectionKey) {
      return sections[mappedSectionKey]?.visible !== false;
    }
    const customSection = sections.customPathsIntro;
    if (!customSection || customSection.visible === false) return false;
    return (customSection.items || []).some(item => normalizePath(item.path) === path);
  };

  const toggleNavPathFeatured = (navItem, nextVisible) => {
    const path = normalizePath(navItem.path);
    if (!path || path === '/') return;
    const mappedSectionKey = PATH_TO_HOME_SECTION[path];
    if (mappedSectionKey) {
      setSections(prev => ({
        ...prev,
        [mappedSectionKey]: {
          ...(prev[mappedSectionKey] || {}),
          visible: nextVisible,
        },
      }));
      return;
    }

    setSections(prev => {
      const currentCustom = prev.customPathsIntro || {
        visible: false,
        heading: { vi: 'Khám phá thêm trên Devhouse', en: 'Explore more on Devhouse' },
        subheading: {
          vi: 'Truy cập nhanh các chuyên mục và dịch vụ trọng tâm.',
          en: 'Quick access to our key sections and services.',
        },
        items: [],
      };
      const existingItems = Array.isArray(currentCustom.items) ? [...currentCustom.items] : [];
      const idx = existingItems.findIndex(item => normalizePath(item.path) === path);
      let nextItems = existingItems;
      if (nextVisible && idx === -1) {
        nextItems = [
          ...existingItems,
          {
            icon: 'globe',
            title: {
              vi: navItem.label?.vi || path,
              en: navItem.label?.en || navItem.label?.vi || path,
            },
            description: {
              vi: `Xem chi tiết nội dung tại ${path}.`,
              en: `Explore details at ${path}.`,
            },
            path,
          },
        ];
      } else if (!nextVisible && idx !== -1) {
        nextItems = existingItems.filter((_, i) => i !== idx);
      }

      return {
        ...prev,
        customPathsIntro: {
          ...currentCustom,
          visible: nextVisible ? true : nextItems.length > 0 && currentCustom.visible !== false,
          items: nextItems,
        },
      };
    });
  };

  const handleSave = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      // Only what differs from the built-in defaults is stored, so untouched text keeps
      // following the defaults when those are improved.
      await apiClient(`/admin/pages/${key}`, {
        method: 'PUT',
        body: JSON.stringify({
          sections: diffSections(sections, page.defaults),
          seo: isEqual(seo, page.defaultSeo) ? {} : seo,
        }),
      });
      setFeedback({
        type: 'success',
        message: 'Đã lưu. Thay đổi sẽ hiện trên website trong khoảng một phút.',
      });
      await loadPage(true);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi lưu trang.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSection = async sectionKey => {
    if (
      !window.confirm(
        'Đặt phần này về nội dung mặc định của hệ thống? Các chỉnh sửa của bạn trong phần này sẽ mất.',
      )
    ) {
      return;
    }
    try {
      setIsSubmitting(true);
      await apiClient(`/admin/pages/${key}/sections/${sectionKey}`, { method: 'DELETE' });
      await loadPage(true);
      setFeedback({ type: 'success', message: 'Đã đặt phần này về mặc định.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể đặt lại phần này.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !page) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải dữ liệu trang...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <p className="p-8 text-sm text-danger">{feedback?.message || 'Không tìm thấy trang.'}</p>
    );
  }

  const definitions = page.definition?.sections || [];
  const overridden = new Set(Object.keys(page.overrides || {}));
  const tabItems = [
    ...(page.definition?.overview ? [{ id: OVERVIEW_TAB, label: 'Các khối trên trang' }] : []),
    ...definitions.map(section => ({
      id: section.key,
      label: `${friendlySectionLabel(section.key, section.label)}${overridden.has(section.key) ? ' ●' : ''}`,
    })),
    { id: 'seo', label: 'Tối ưu SEO Google' },
  ];
  const currentDefinition = definitions.find(section => section.key === activeTab);
  const publicPath = PUBLIC_URL_MAP[key];

  // Combine Nav Menu items with all standard main paths so /projects and every /path is always configurable
  const combinedNavTabs = (() => {
    const map = new Map();
    for (const item of navHeader) {
      const p = normalizePath(item.path);
      if (p && p !== '/') {
        map.set(p, { path: p, label: item.label || { vi: p, en: p }, inMenu: item.visible !== false });
      }
    }
    for (const std of STATIC_SITE_PATHS.filter(s => s.group === 'Trang chính (Menu điều hướng)')) {
      const p = normalizePath(std.path);
      if (p && p !== '/' && !map.has(p)) {
        map.set(p, { path: p, label: std.label, inMenu: false });
      }
    }
    return Array.from(map.values());
  })();

  return (
    <ResourceForm
      title={`Chỉnh sửa trang: ${typeof page.title === 'object' ? page.title.vi || page.title.en : page.title || key}`}
      subtitle="Chỉnh sửa Tiêu đề chính (Heading), Đoạn mô tả (Subheading), Lời giới thiệu và nút bấm bằng cả 2 ngôn ngữ. Dấu ● nghĩa là phần đó đã được bạn chỉnh sửa riêng."
      backUrl="/pages"
      onSubmit={handleSave}
      isSubmitting={isSubmitting}
      extraActions={
        <div className="flex items-center gap-2">
          {publicPath && (
            <a
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-sunken text-xs font-semibold text-fg transition-colors"
            >
              <span>Xem trang ngoài web</span>
            </a>
          )}
          {currentDefinition && overridden.has(activeTab) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleResetSection(activeTab)}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Đặt lại phần này
            </Button>
          )}
        </div>
      }
    >
      {feedback && (
        <div
          role="status"
          className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-success-subtle text-success border-success/20'
              : 'bg-danger-subtle text-danger border-danger/20'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === OVERVIEW_TAB ? (
        <div className="space-y-6">
          {key === 'home' && combinedNavTabs.length > 0 && (
            <Card className="p-6 space-y-4 border-primary/25 bg-primary-subtle/20">
              <div className="flex items-start gap-2.5 border-b border-border/70 pb-3">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-fg">
                    Cấu hình bật nổi bật ngoài Trang chủ cho mọi trang có /path ở Menu điều hướng
                  </h3>
                  <p className="text-xs text-fg-muted mt-0.5">
                    Bật công tắc cho trang <code className="font-semibold">/path</code> nào (bao gồm{' '}
                    <code className="font-semibold">/projects</code>,{' '}
                    <code className="font-semibold">/products</code>,{' '}
                    <code className="font-semibold">/services</code>,{' '}
                    <code className="font-semibold">/packages</code>,{' '}
                    <code className="font-semibold">/solutions</code>,{' '}
                    <code className="font-semibold">/technologies</code>,{' '}
                    <code className="font-semibold">/blog</code>,{' '}
                    <code className="font-semibold">/about</code>,{' '}
                    <code className="font-semibold">/careers</code>...) thì khối nổi bật của trang đó
                    sẽ hiển thị ngoài Trang chủ.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {combinedNavTabs.map(tab => {
                  const isOn = isNavPathFeatured(tab.path);
                  return (
                    <div
                      key={tab.path}
                      className={`rounded-xl border p-3 transition-colors ${
                        isOn
                          ? 'border-primary/40 bg-surface'
                          : 'border-border/70 bg-surface-sunken/50'
                      }`}
                    >
                      <Toggle
                        label={`${tab.label?.vi || tab.path} (${tab.path})`}
                        hint={
                          tab.inMenu
                            ? 'Đang có trên Menu chính'
                            : 'Trang có sẵn trên hệ thống'
                        }
                        checked={isOn}
                        onChange={next => toggleNavPathFeatured(tab, next)}
                      />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="mb-5 border-b border-border pb-3 text-sm font-bold text-fg">
              Các khối trên trang (Bật/Tắt & Chọn kiểu hiển thị Lưới / Danh sách / Slide)
            </h3>
            <PageOverview
              sections={definitions}
              values={sections}
              labelOf={section => friendlySectionLabel(section.key, section.label)}
              onChange={(sectionKey, next) => setSections({ ...sections, [sectionKey]: next })}
              onEdit={sectionKey => setActiveTab(sectionKey)}
            />
          </Card>
        </div>
      ) : activeTab === 'seo' ? (
        <Card className="p-6 space-y-6">
          <h3 className="text-sm font-bold text-fg border-b border-border pb-3">
            Tiêu đề và mô tả hiển thị trên Google
          </h3>
          <LocalizedField
            label="Tiêu đề trang (Meta title)"
            value={seo.title || { vi: '', en: '' }}
            onChange={val => setSeo({ ...seo, title: val })}
          />
          <LocalizedField
            label="Mô tả ngắn (Meta description)"
            type="textarea"
            rows={3}
            value={seo.description || { vi: '', en: '' }}
            onChange={val => setSeo({ ...seo, description: val })}
          />
        </Card>
      ) : currentDefinition ? (
        <Card className="p-6">
          <h3 className="mb-5 border-b border-border pb-3 text-sm font-bold text-fg">
            {currentDefinition.label || currentDefinition.key}
          </h3>
          <SectionForm
            section={currentDefinition}
            value={sections[activeTab]}
            onChange={next => setSections({ ...sections, [activeTab]: next })}
          />
        </Card>
      ) : null}
    </ResourceForm>
  );
}

