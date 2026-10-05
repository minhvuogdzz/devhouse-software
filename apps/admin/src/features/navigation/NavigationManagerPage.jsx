import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ListField } from '../../components/form/ListField.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';

const blank = () => ({ vi: '', en: '' });
const clone = value => JSON.parse(JSON.stringify(value));

export default function NavigationManagerPage() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('header');
  const [header, setHeader] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const load = async () => {
    try {
      const res = await apiClient('/admin/navigation/main');
      setData(res.data);
      setHeader(clone(res.data.header || []));
      setColumns(clone(res.data.footer?.columns || []));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể tải menu.' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      await apiClient('/admin/navigation/main', {
        method: 'PUT',
        body: JSON.stringify({
          header: header.map((item, index) => ({
            ...item,
            id: item.id || `nav-${Date.now()}-${index}`,
            order: index + 1,
            visible: item.visible !== false,
          })),
          footer: { columns },
        }),
      });
      setFeedback({
        type: 'success',
        message: 'Đã lưu menu. Website cập nhật trong khoảng một phút.',
      });
      await load();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi khi lưu menu.' });
    } finally {
      setIsSaving(false);
    }
  };

  const useDefaults = () => {
    if (!window.confirm('Nạp lại menu mặc định? Các chỉnh sửa chưa lưu sẽ mất.')) return;
    setHeader(clone(data.defaults.header));
    setColumns(clone(data.defaults.footer.columns));
    setFeedback({
      type: 'success',
      message: 'Đã nạp menu mặc định. Bấm “Lưu thay đổi” để áp dụng lên website.',
    });
  };

  if (!data) {
    return (
      <div className="py-20 text-center text-fg-muted">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs">{feedback?.message || 'Đang tải menu...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
            Menu điều hướng
          </h1>
          <p className="mt-1 text-xs text-fg-muted">
            Menu ở đầu trang và chân trang của website. Đường dẫn bắt đầu bằng “/” là trang trong
            website (ví dụ /services); có thể dùng https://… cho trang bên ngoài.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <Button type="button" variant="outline" size="sm" onClick={useDefaults}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Nạp menu mặc định
          </Button>
          <Button type="button" onClick={handleSave} isLoading={isSaving}>
            Lưu thay đổi
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-xl border p-4 text-xs ${
            feedback.type === 'success'
              ? 'border-success/20 bg-success-subtle text-success'
              : 'border-danger/20 bg-danger-subtle text-danger'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <Tabs
        tabs={[
          { id: 'header', label: 'Menu đầu trang' },
          { id: 'footer', label: 'Menu chân trang' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'header' ? (
        <Card className="p-6">
          <ListField
            items={header}
            onChange={setHeader}
            addLabel="Thêm mục menu"
            emptyText="Menu đầu trang đang trống."
            createItem={() => ({
              id: `nav-${Date.now()}`,
              label: blank(),
              path: '/',
              order: header.length + 1,
              visible: true,
            })}
            itemTitle={(item, index) => `${index + 1}. ${item.label?.vi || 'Mục mới'}`}
            renderItem={(item, setItem) => (
              <>
                <LocalizedField
                  label="Chữ hiển thị"
                  value={item.label}
                  onChange={label => setItem({ ...item, label })}
                />
                <Input
                  label="Đường dẫn"
                  value={item.path || ''}
                  onChange={e => setItem({ ...item, path: e.target.value })}
                  placeholder="/services"
                />
                <Toggle
                  label="Hiển thị trên website"
                  checked={item.visible !== false}
                  onChange={visible => setItem({ ...item, visible })}
                />
              </>
            )}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <ListField
            items={columns}
            onChange={setColumns}
            addLabel="Thêm cột"
            emptyText="Chân trang chưa có cột nào."
            createItem={() => ({ title: blank(), links: [] })}
            itemTitle={(item, index) => `Cột ${index + 1}: ${item.title?.vi || 'Cột mới'}`}
            renderItem={(column, setColumn) => (
              <>
                <LocalizedField
                  label="Tiêu đề cột"
                  value={column.title}
                  onChange={title => setColumn({ ...column, title })}
                />
                <ListField
                  label="Các liên kết"
                  items={column.links}
                  onChange={links => setColumn({ ...column, links })}
                  addLabel="Thêm liên kết"
                  emptyText="Cột này chưa có liên kết."
                  createItem={() => ({ label: blank(), path: '/' })}
                  itemTitle={(link, index) => `${index + 1}. ${link.label?.vi || 'Liên kết mới'}`}
                  renderItem={(link, setLink) => (
                    <>
                      <LocalizedField
                        label="Chữ hiển thị"
                        value={link.label}
                        onChange={label => setLink({ ...link, label })}
                      />
                      <Input
                        label="Đường dẫn"
                        value={link.path || ''}
                        onChange={e => setLink({ ...link, path: e.target.value })}
                        placeholder="/about"
                      />
                    </>
                  )}
                />
              </>
            )}
          />
        </Card>
      )}
    </div>
  );
}
