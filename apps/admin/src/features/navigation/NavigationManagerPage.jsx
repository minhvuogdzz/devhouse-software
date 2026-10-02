import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';

export default function NavigationManagerPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('header');

  const { data: navData, isLoading } = useQuery({
    queryKey: ['navigation', 'main'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/navigation/main');
      return res.data;
    },
  });

  const [headerItems, setHeaderItems] = useState([]);
  const [footerColumns, setFooterColumns] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (navData) {
      setHeaderItems(navData.header || []);
      setFooterColumns(navData.footer?.columns || []);
    }
  }, [navData]);

  const saveMutation = useMutation({
    mutationFn: async payload => {
      return apiClient.put('/admin/navigation/main', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation', 'main'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      header: headerItems,
      footer: { columns: footerColumns },
    });
  };

  const addHeaderItem = () => {
    const newItem = {
      id: `nav-${Date.now()}`,
      label: { vi: 'Mục mới', en: 'New item' },
      path: '/',
      order: headerItems.length + 1,
      visible: true,
    };
    setHeaderItems([...headerItems, newItem]);
  };

  const updateHeaderItem = (index, field, value) => {
    const updated = [...headerItems];
    if (field === 'labelVi') {
      updated[index] = { ...updated[index], label: { ...updated[index].label, vi: value } };
    } else if (field === 'labelEn') {
      updated[index] = { ...updated[index], label: { ...updated[index].label, en: value } };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setHeaderItems(updated);
  };

  const removeHeaderItem = index => {
    setHeaderItems(headerItems.filter((_, i) => i !== index));
  };

  const addFooterColumn = () => {
    const newCol = {
      title: { vi: 'Cột mới', en: 'New Column' },
      links: [],
    };
    setFooterColumns([...footerColumns, newCol]);
  };

  const updateColumnTitle = (colIndex, lang, value) => {
    const updated = [...footerColumns];
    updated[colIndex] = {
      ...updated[colIndex],
      title: { ...updated[colIndex].title, [lang]: value },
    };
    setFooterColumns(updated);
  };

  const removeFooterColumn = colIndex => {
    setFooterColumns(footerColumns.filter((_, i) => i !== colIndex));
  };

  const addFooterLink = colIndex => {
    const updated = [...footerColumns];
    const newLink = {
      label: { vi: 'Liên kết mới', en: 'New link' },
      path: '/',
    };
    updated[colIndex] = {
      ...updated[colIndex],
      links: [...(updated[colIndex].links || []), newLink],
    };
    setFooterColumns(updated);
  };

  const updateFooterLink = (colIndex, linkIndex, field, value) => {
    const updated = [...footerColumns];
    const links = [...(updated[colIndex].links || [])];
    if (field === 'labelVi') {
      links[linkIndex] = { ...links[linkIndex], label: { ...links[linkIndex].label, vi: value } };
    } else if (field === 'labelEn') {
      links[linkIndex] = { ...links[linkIndex], label: { ...links[linkIndex].label, en: value } };
    } else {
      links[linkIndex] = { ...links[linkIndex], [field]: value };
    }
    updated[colIndex] = { ...updated[colIndex], links };
    setFooterColumns(updated);
  };

  const removeFooterLink = (colIndex, linkIndex) => {
    const updated = [...footerColumns];
    updated[colIndex] = {
      ...updated[colIndex],
      links: updated[colIndex].links.filter((_, i) => i !== linkIndex),
    };
    setFooterColumns(updated);
  };

  if (isLoading) {
    return <div className="p-8 text-fg-muted">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {locale === 'vi' ? 'Quản lý Menu & Điều hướng' : 'Navigation Menus'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {locale === 'vi'
              ? 'Tùy chỉnh thanh menu đầu trang (Header) và các cột liên kết cuối trang (Footer).'
              : 'Configure main navigation header and footer column links across both languages.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-success">
              {locale === 'vi' ? '✓ Đã lưu thành công' : '✓ Saved successfully'}
            </span>
          )}
          <Button variant="primary" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          {
            key: 'header',
            label: locale === 'vi' ? 'Menu đầu trang (Header)' : 'Header Navigation',
          },
          { key: 'footer', label: locale === 'vi' ? 'Chân trang (Footer)' : 'Footer Columns' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'header' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-fg">
              {locale === 'vi' ? 'Danh sách mục Menu chính' : 'Header Menu Items'}
            </h2>
            <Button variant="secondary" size="sm" onClick={addHeaderItem}>
              + {locale === 'vi' ? 'Thêm mục' : 'Add Item'}
            </Button>
          </div>

          <div className="space-y-3">
            {headerItems.map((item, index) => (
              <div
                key={item.id || index}
                className="p-4 rounded-lg border border-border bg-surface-raised flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <div className="w-12">
                  <Input
                    type="number"
                    value={item.order ?? index + 1}
                    onChange={e => updateHeaderItem(index, 'order', parseInt(e.target.value) || 0)}
                    placeholder="STT"
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  <Input
                    placeholder="Tiêu đề (VI)"
                    value={item.label?.vi || ''}
                    onChange={e => updateHeaderItem(index, 'labelVi', e.target.value)}
                  />
                  <Input
                    placeholder="Label (EN)"
                    value={item.label?.en || ''}
                    onChange={e => updateHeaderItem(index, 'labelEn', e.target.value)}
                  />
                  <Input
                    placeholder="Đường dẫn (path, vd: /services)"
                    value={item.path || ''}
                    onChange={e => updateHeaderItem(index, 'path', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-fg-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.visible !== false}
                      onChange={e => updateHeaderItem(index, 'visible', e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    {locale === 'vi' ? 'Hiển thị' : 'Visible'}
                  </label>
                  <Button variant="danger" size="sm" onClick={() => removeHeaderItem(index)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            ))}
            {headerItems.length === 0 && (
              <p className="text-sm text-fg-muted py-6 text-center">
                {locale === 'vi' ? 'Chưa có mục menu nào.' : 'No header items configured.'}
              </p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'footer' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={addFooterColumn}>
              + {locale === 'vi' ? 'Thêm cột Footer' : 'Add Footer Column'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {footerColumns.map((col, colIndex) => (
              <Card key={colIndex} className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                    {locale === 'vi' ? `Cột ${colIndex + 1}` : `Column ${colIndex + 1}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:text-danger hover:bg-danger-surface"
                    onClick={() => removeFooterColumn(colIndex)}
                  >
                    {t('common.delete')}
                  </Button>
                </div>

                <div className="space-y-3 mb-6">
                  <Input
                    label={locale === 'vi' ? 'Tiêu đề cột (VI)' : 'Column Title (VI)'}
                    value={col.title?.vi || ''}
                    onChange={e => updateColumnTitle(colIndex, 'vi', e.target.value)}
                  />
                  <Input
                    label={locale === 'vi' ? 'Tiêu đề cột (EN)' : 'Column Title (EN)'}
                    value={col.title?.en || ''}
                    onChange={e => updateColumnTitle(colIndex, 'en', e.target.value)}
                  />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-fg-muted">
                      {locale === 'vi' ? 'Các liên kết' : 'Links'}
                    </span>
                    <button
                      type="button"
                      onClick={() => addFooterLink(colIndex)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      + {locale === 'vi' ? 'Thêm liên kết' : 'Add Link'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {col.links?.map((link, linkIndex) => (
                      <div
                        key={linkIndex}
                        className="p-2.5 rounded border border-border bg-surface-raised space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-fg-muted">#{linkIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeFooterLink(colIndex, linkIndex)}
                            className="text-xs text-danger hover:underline"
                          >
                            ×
                          </button>
                        </div>
                        <Input
                          placeholder="Label (VI)"
                          value={link.label?.vi || ''}
                          onChange={e =>
                            updateFooterLink(colIndex, linkIndex, 'labelVi', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Label (EN)"
                          value={link.label?.en || ''}
                          onChange={e =>
                            updateFooterLink(colIndex, linkIndex, 'labelEn', e.target.value)
                          }
                        />
                        <Input
                          placeholder="Path (/terms, /privacy, ...)"
                          value={link.path || ''}
                          onChange={e =>
                            updateFooterLink(colIndex, linkIndex, 'path', e.target.value)
                          }
                        />
                      </div>
                    ))}
                    {(!col.links || col.links.length === 0) && (
                      <p className="text-xs text-fg-muted py-2 text-center">
                        {locale === 'vi' ? 'Chưa có liên kết nào.' : 'No links.'}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
