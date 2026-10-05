import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';
import { diffSections, isEqual } from '../../lib/content-diff.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { SectionForm } from '../../components/content/SectionForm.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Button } from '../../components/ui/Button.jsx';

const clone = value => JSON.parse(JSON.stringify(value ?? null));

export default function PageEditorPage() {
  const { key } = useParams();

  const [page, setPage] = useState(null);
  const [sections, setSections] = useState({});
  const [seo, setSeo] = useState({ title: { vi: '', en: '' }, description: { vi: '', en: '' } });
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
      const res = await apiClient(`/admin/pages/${key}`);
      const data = res.data;
      setPage(data);
      setSections(clone(data.resolved));
      setSeo(clone(data.seo) || { title: { vi: '', en: '' }, description: { vi: '', en: '' } });
      const first = data.definition?.sections?.[0]?.key || 'seo';
      setActiveTab(current => (keepTab && current ? current : first));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể tải dữ liệu trang.' });
    } finally {
      setIsLoading(false);
    }
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
    ...definitions.map(section => ({
      id: section.key,
      label: `${section.label || section.key}${overridden.has(section.key) ? ' ●' : ''}`,
    })),
    { id: 'seo', label: 'SEO & Meta' },
  ];
  const currentDefinition = definitions.find(section => section.key === activeTab);

  return (
    <ResourceForm
      title={`Chỉnh sửa trang: ${page.title?.vi || key}`}
      subtitle="Sửa chữ, nút bấm và nội dung bằng cả hai ngôn ngữ. Dấu ● nghĩa là phần đó đã được bạn chỉnh; phần còn lại dùng nội dung mặc định của hệ thống."
      backUrl="/pages"
      onSubmit={handleSave}
      isSubmitting={isSubmitting}
      extraActions={
        currentDefinition && overridden.has(activeTab) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleResetSection(activeTab)}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Đặt lại phần này
          </Button>
        ) : null
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

      {activeTab === 'seo' ? (
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
