import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { RotateCcw, CheckCircle2, AlertCircle, Plus, Sparkles, ExternalLink } from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';
import { diffSections, isEqual } from '../../lib/content-diff.js';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { ListField } from '../../components/form/ListField.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import {
  PathPickerInput,
  STATIC_SITE_PATHS,
  PATH_TO_HOME_SECTION,
  useSitePaths,
} from '../../components/form/PathPickerInput.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Select } from '../../components/ui/Input.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

const blank = () => ({ vi: '', en: '' });
const clone = value => JSON.parse(JSON.stringify(value ?? null));

function normalizePath(rawPath) {
  const trimmed = (rawPath || '').trim();
  if (!trimmed) return '';
  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    return trimmed.slice(0, -1);
  }
  return trimmed;
}

export default function NavigationManagerPage() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('header');
  const [header, setHeader] = useState([]);
  const [columns, setColumns] = useState([]);
  const [homePage, setHomePage] = useState(null);
  const [homeSections, setHomeSections] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const allSitePaths = useSitePaths();

  const load = async () => {
    try {
      const [navRes, homeRes] = await Promise.all([
        apiClient('/admin/navigation/main'),
        apiClient('/admin/pages/home').catch(() => null),
      ]);
      setData(navRes.data);
      setHeader(clone(navRes.data.header || []));
      setColumns(clone(navRes.data.footer?.columns || []));
      if (homeRes?.data) {
        setHomePage(homeRes.data);
        setHomeSections(clone(homeRes.data.resolved || {}));
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Không thể tải menu.' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const isPathFeaturedOnHome = (rawPath) => {
    if (!homeSections) return false;
    const path = normalizePath(rawPath);
    if (!path || path === '/') return true;

    const mappedSectionKey = PATH_TO_HOME_SECTION[path];
    if (mappedSectionKey) {
      return homeSections[mappedSectionKey]?.visible !== false;
    }

    const customSection = homeSections.customPathsIntro;
    if (!customSection || customSection.visible === false) return false;
    return (customSection.items || []).some(item => normalizePath(item.path) === path);
  };

  const togglePathFeaturedOnHome = (navItem, nextVisible) => {
    if (!homeSections) return;
    const path = normalizePath(navItem.path);
    if (!path || path === '/') return;

    const mappedSectionKey = PATH_TO_HOME_SECTION[path];
    if (mappedSectionKey) {
      setHomeSections(prev => ({
        ...prev,
        [mappedSectionKey]: {
          ...(prev[mappedSectionKey] || {}),
          visible: nextVisible,
        },
      }));
      return;
    }

    setHomeSections(prev => {
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
      if (nextVisible) {
        if (idx === -1) {
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
        }
      } else if (idx !== -1) {
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

  const handleQuickAddHeaderPath = option => {
    if (!option?.path) return;
    setHeader(prev => [
      ...prev,
      {
        id: `nav-${Date.now()}-${prev.length}`,
        label: { vi: option.label.vi, en: option.label.en },
        path: option.path,
        order: prev.length + 1,
        visible: true,
      },
    ]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const requests = [
        apiClient('/admin/navigation/main', {
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
        }),
      ];

      if (homePage && homeSections) {
        requests.push(
          apiClient('/admin/pages/home', {
            method: 'PUT',
            body: JSON.stringify({
              sections: diffSections(homeSections, homePage.defaults),
              seo: isEqual(homePage.seo, homePage.defaultSeo) ? {} : homePage.seo,
            }),
          }),
        );
      }

      await Promise.all(requests);
      setFeedback({
        type: 'success',
        message:
          'Đã lưu menu và cấu hình hiển thị nổi bật ngoài Trang chủ. Website cập nhật ngay.',
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

  const existingHeaderPaths = new Set(header.map(item => normalizePath(item.path)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
            Menu điều hướng & Tab nổi bật Trang chủ
          </h1>
          <p className="mt-1 text-xs text-fg-muted">
            Quản lý các đường dẫn <code className="font-semibold text-fg">/path</code> trên thanh
            Menu đầu trang, chân trang và bật/tắt hiển thị khối nổi bật ngoài Trang chủ cho mọi
            trang có trong Menu.
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
          { id: 'header', label: 'Menu đầu trang & Bật nổi bật Trang chủ' },
          { id: 'footer', label: 'Menu chân trang' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'header' ? (
        <div className="space-y-5">
          {/* Quick-add /path picker card */}
          <Card className="p-5 space-y-3 border-primary/25 bg-primary-subtle/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <h2 className="text-xs font-bold text-fg">
                  Danh sách đường dẫn (/path) có sẵn — Bấm để thêm nhanh vào Menu đầu trang
                </h2>
              </div>
              <Link
                to="/pages/home"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>Tuỳ chỉnh bố cục các khối nổi bật trên Trang chủ</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-xs text-fg-muted">
              Không cần nhớ tên đường dẫn: bấm vào một <code className="font-semibold">/path</code>{' '}
              bên dưới hoặc chọn trong danh sách thả xuống để thêm ngay vào Menu đầu trang (tự động
              điền sẵn tên Tiếng Việt & Tiếng Anh).
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {STATIC_SITE_PATHS.map(option => {
                const alreadyAdded = existingHeaderPaths.has(normalizePath(option.path));
                return (
                  <button
                    key={option.path}
                    type="button"
                    onClick={() => handleQuickAddHeaderPath(option)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      alreadyAdded
                        ? 'border-border bg-surface text-fg-muted hover:border-primary/50'
                        : 'border-primary/40 bg-surface text-fg hover:bg-primary hover:text-primary-fg'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold">{option.path}</span>
                    <span className="opacity-80">({option.label.vi})</span>
                    {alreadyAdded && (
                      <Badge variant="secondary" size="sm">
                        Đã có
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="pt-1 max-w-md">
              <Select
                label="Hoặc chọn thêm từ toàn bộ trang chi tiết (Dịch vụ, Dự án, Giải pháp...)"
                value=""
                onChange={e => {
                  const chosen = allSitePaths.find(p => p.path === e.target.value);
                  if (chosen) handleQuickAddHeaderPath(chosen);
                }}
              >
                <option value="">-- Chọn một /path bất kỳ để thêm vào Menu đầu trang --</option>
                {allSitePaths.map(item => (
                  <option key={item.path} value={item.path}>
                    {item.path} — {item.label.vi} ({item.label.en})
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card className="p-6">
            <ListField
              items={header}
              onChange={setHeader}
              addLabel="Thêm mục menu"
              emptyText="Menu đầu trang đang trống."
              createItem={() => ({
                id: `nav-${Date.now()}`,
                label: blank(),
                path: '/services',
                order: header.length + 1,
                visible: true,
              })}
              itemTitle={(item, index) =>
                `${index + 1}. ${item.label?.vi || 'Mục mới'} (${item.path || '/'})`
              }
              renderItem={(item, setItem) => {
                const pathNorm = normalizePath(item.path);
                const mappedHomeKey = PATH_TO_HOME_SECTION[pathNorm];
                const featuredOnHome = isPathFeaturedOnHome(item.path);

                return (
                  <div className="space-y-4">
                    <LocalizedField
                      label="Chữ hiển thị"
                      value={item.label}
                      onChange={label => setItem({ ...item, label })}
                    />
                    <PathPickerInput
                      label="Đường dẫn (/path)"
                      value={item.path || ''}
                      onChange={path => setItem({ ...item, path })}
                      onSelectOption={option => {
                        const currentVi = item.label?.vi?.trim();
                        const currentEn = item.label?.en?.trim();
                        setItem({
                          ...item,
                          path: option.path,
                          label: {
                            vi: currentVi || option.label.vi,
                            en: currentEn || option.label.en,
                          },
                        });
                      }}
                      placeholder="/projects"
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                      <div className="rounded-xl border border-border bg-surface-sunken/40 p-3">
                        <Toggle
                          label="Hiển thị trên thanh Menu"
                          hint="Bật để hiện tab này trên thanh điều hướng đầu trang."
                          checked={item.visible !== false}
                          onChange={visible => setItem({ ...item, visible })}
                        />
                      </div>

                      {pathNorm && pathNorm !== '/' && homeSections && (
                        <div className="rounded-xl border border-primary/25 bg-primary-subtle/20 p-3">
                          <Toggle
                            label={`Bật mục nổi bật ngoài Trang chủ (${pathNorm})`}
                            hint={
                              mappedHomeKey
                                ? `Hiển thị khối nổi bật của ${pathNorm} ngay trên Trang chủ (/).`
                                : `Hiển thị thẻ liên kết nổi bật tới ${pathNorm} trên Trang chủ (/).`
                            }
                            checked={featuredOnHome}
                            onChange={nextVisible => togglePathFeaturedOnHome(item, nextVisible)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
          </Card>
        </div>
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
                  itemTitle={(link, index) =>
                    `${index + 1}. ${link.label?.vi || 'Liên kết mới'} (${link.path || '/'})`
                  }
                  renderItem={(link, setLink) => (
                    <div className="space-y-3">
                      <LocalizedField
                        label="Chữ hiển thị"
                        value={link.label}
                        onChange={label => setLink({ ...link, label })}
                      />
                      <PathPickerInput
                        label="Đường dẫn (/path)"
                        value={link.path || ''}
                        onChange={path => setLink({ ...link, path })}
                        onSelectOption={option => {
                          const currentVi = link.label?.vi?.trim();
                          const currentEn = link.label?.en?.trim();
                          setLink({
                            ...link,
                            path: option.path,
                            label: {
                              vi: currentVi || option.label.vi,
                              en: currentEn || option.label.en,
                            },
                          });
                        }}
                        placeholder="/about"
                      />
                    </div>
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

