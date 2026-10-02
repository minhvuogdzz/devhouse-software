import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { ResourceForm } from '../../components/form/ResourceForm.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PageEditorPage() {
  const { key } = useParams();

  const [sections, setSections] = useState({});
  const [seo, setSeo] = useState({ title: { vi: '', en: '' }, description: { vi: '', en: '' } });
  const [activeTab, setActiveTab] = useState('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadPage();
  }, [key]);

  const loadPage = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/pages/${key}`);
      const d = res.data;

      // Initialize resolved sections
      const resolvedSections = d.resolved?.sections || d.defaults?.sections || {};
      setSections(JSON.parse(JSON.stringify(resolvedSections)));

      const resolvedSeo = d.resolved?.seo || d.defaults?.seo || { title: {}, description: {} };
      setSeo(JSON.parse(JSON.stringify(resolvedSeo)));

      // Set active tab to first section
      const firstSectionKey = Object.keys(resolvedSections)[0] || 'seo';
      setActiveTab(firstSectionKey);
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
      await apiClient(`/admin/pages/${key}`, {
        method: 'PUT',
        body: JSON.stringify({
          overrides: {
            sections,
            seo,
          },
        }),
      });
      setFeedback({
        type: 'success',
        message: 'Lưu thay đổi thành công! Dữ liệu sẽ cập nhật trên website trong ít phút.',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi lưu trang.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSection = async sectionKey => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn đặt lại phần "${sectionKey}" về mặc định của hệ thống?`,
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient(`/admin/pages/${key}/sections/${sectionKey}`, {
        method: 'DELETE',
      });
      await loadPage();
      setFeedback({ type: 'success', message: `Đã đặt lại phần "${sectionKey}" về mặc định!` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể đặt lại phần này.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải dữ liệu trang...</p>
      </div>
    );
  }

  const sectionKeys = Object.keys(sections);
  const tabItems = [
    ...sectionKeys.map(sKey => ({
      id: sKey,
      label: sKey.toUpperCase(),
    })),
    { id: 'seo', label: 'SEO & Meta' },
  ];

  const currentSection = sections[activeTab];

  return (
    <ResourceForm
      title={`Chỉnh sửa trang: ${key}`}
      subtitle="Tùy biến các trường nội dung song ngữ. Nội dung không thay đổi sẽ sử dụng giá trị mặc định của hệ thống."
      backUrl="/content/pages"
      onSubmit={handleSave}
      isSubmitting={isSubmitting}
      extraActions={
        activeTab !== 'seo' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleResetSection(activeTab)}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Đặt lại phần này
          </Button>
        )
      }
    >
      {feedback && (
        <div
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

      {/* Tabs */}
      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      {/* Active Tab Form */}
      {activeTab === 'seo' ? (
        <Card className="p-6 space-y-6">
          <h3 className="text-sm font-bold text-fg border-b border-border pb-3">
            Cấu hình Thẻ Tiêu đề & Mô tả Tìm kiếm (SEO)
          </h3>
          <LocalizedField
            label="Tiêu đề trang (Meta Title)"
            value={seo.title || { vi: '', en: '' }}
            onChange={val => setSeo({ ...seo, title: val })}
          />
          <LocalizedField
            label="Mô tả tóm tắt (Meta Description)"
            type="textarea"
            rows={3}
            value={seo.description || { vi: '', en: '' }}
            onChange={val => setSeo({ ...seo, description: val })}
          />
        </Card>
      ) : currentSection ? (
        <Card className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-fg">
              Phần nội dung: <span className="text-primary font-display">{activeTab}</span>
            </h3>
          </div>

          <div className="space-y-4">
            {Object.keys(currentSection).map(fieldKey => {
              const fieldValue = currentSection[fieldKey];

              // Localized string field
              if (
                typeof fieldValue === 'object' &&
                fieldValue !== null &&
                ('vi' in fieldValue || 'en' in fieldValue)
              ) {
                const isLong =
                  fieldKey.toLowerCase().includes('desc') || fieldKey.toLowerCase().includes('sub');
                return (
                  <LocalizedField
                    key={fieldKey}
                    label={`Trường: ${fieldKey}`}
                    type={isLong ? 'textarea' : 'text'}
                    rows={3}
                    value={fieldValue}
                    onChange={val =>
                      setSections({
                        ...sections,
                        [activeTab]: {
                          ...sections[activeTab],
                          [fieldKey]: val,
                        },
                      })
                    }
                  />
                );
              }

              // Simple string/number/boolean
              if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
                return (
                  <Input
                    key={fieldKey}
                    label={`Trường: ${fieldKey}`}
                    value={fieldValue}
                    onChange={e =>
                      setSections({
                        ...sections,
                        [activeTab]: {
                          ...sections[activeTab],
                          [fieldKey]: e.target.value,
                        },
                      })
                    }
                  />
                );
              }

              return null;
            })}
          </div>
        </Card>
      ) : null}
    </ResourceForm>
  );
}
