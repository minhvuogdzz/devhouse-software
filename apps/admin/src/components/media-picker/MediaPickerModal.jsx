import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { apiClient } from '../../lib/api-client.js';
import { Image as ImageIcon, Upload, Check, AlertTriangle } from 'lucide-react';

export function MediaPickerModal({ isOpen, onClose, onSelect, value }) {
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'upload'
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotConfigured, setIsNotConfigured] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(value || null);
  const [altVi, setAltVi] = useState(value?.alt?.vi || '');
  const [altEn, setAltEn] = useState(value?.alt?.en || '');

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    try {
      setIsLoading(true);
      setIsNotConfigured(false);
      const res = await apiClient('/admin/media?limit=50');
      setMediaList(res.data || []);
    } catch (err) {
      if (err.status === 503 || err.code === 'MEDIA_NOT_CONFIGURED') {
        setIsNotConfigured(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedAsset) {
      onSelect(null);
      onClose();
      return;
    }

    onSelect({
      publicId: selectedAsset.publicId,
      url: selectedAsset.secureUrl || selectedAsset.url,
      width: selectedAsset.width,
      height: selectedAsset.height,
      alt: {
        vi: altVi,
        en: altEn,
      },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chọn hình ảnh từ thư viện"
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!selectedAsset}>
            Xác nhận chọn
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Unconfigured Alert */}
        {isNotConfigured && (
          <div className="p-4 rounded-xl bg-warning-subtle text-warning border border-warning/20 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Cloudinary chưa được cấu hình</p>
              <p>
                Dịch vụ lưu trữ media đang ở chế độ chờ cấu hình tài khoản. Bạn có thể tiếp tục nhập
                URL ảnh thủ công hoặc sử dụng hệ thống mà không cần ảnh (quy tắc P3).
              </p>
            </div>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-border pb-2 gap-2">
          <Button
            size="sm"
            variant={activeTab === 'library' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('library')}
          >
            <ImageIcon className="w-4 h-4 mr-1.5" />
            Thư viện ảnh
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'upload' ? 'primary' : 'outline'}
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Tải ảnh mới / Nhập URL
          </Button>
        </div>

        {activeTab === 'library' ? (
          <div>
            {isLoading ? (
              <div className="text-center py-16 text-fg-muted">
                <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs">Đang tải danh sách ảnh...</p>
              </div>
            ) : mediaList.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl text-fg-muted">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Chưa có ảnh nào trong thư viện.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                {mediaList.map(asset => {
                  const isSelected = selectedAsset?.publicId === asset.publicId;
                  return (
                    <div
                      key={asset._id || asset.publicId}
                      onClick={() => {
                        setSelectedAsset(asset);
                        setAltVi(asset.alt?.vi || '');
                        setAltEn(asset.alt?.en || '');
                      }}
                      className={`relative aspect-video rounded-lg border overflow-hidden cursor-pointer group ${
                        isSelected
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border hover:border-fg-muted'
                      }`}
                    >
                      <img
                        src={asset.secureUrl || asset.url}
                        alt={asset.alt?.vi || asset.filename}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary text-primary-fg flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 p-4 rounded-xl border border-border bg-surface-raised/40">
            <p className="text-xs text-fg-muted leading-relaxed">
              Bạn có thể nhập liên kết ảnh trực tiếp để gán vào mục nội dung này:
            </p>
            <Input
              label="URL hình ảnh"
              placeholder="https://example.com/image.webp"
              value={selectedAsset?.url || ''}
              onChange={e =>
                setSelectedAsset({
                  publicId: 'manual-' + Date.now(),
                  url: e.target.value,
                  width: 800,
                  height: 600,
                })
              }
            />
          </div>
        )}

        {/* Alt text fields */}
        {selectedAsset && (
          <div className="space-y-3 pt-3 border-t border-border">
            <h4 className="text-xs font-bold text-fg">Mô tả văn bản thay thế (Alt text):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Alt text (Tiếng Việt)"
                value={altVi}
                onChange={e => setAltVi(e.target.value)}
                placeholder="Mô tả nội dung bức ảnh..."
              />
              <Input
                label="Alt text (English)"
                value={altEn}
                onChange={e => setAltEn(e.target.value)}
                placeholder="Image description..."
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export function ImageField({ label, value, onChange }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-fg">{label}</label>}
      {value?.url ? (
        <div className="relative w-48 aspect-video rounded-xl border border-border overflow-hidden group bg-surface-sunken">
          <img
            src={value.url}
            alt={value.alt?.vi || 'Preview'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
            <Button size="sm" variant="secondary" onClick={() => setIsPickerOpen(true)}>
              Thay đổi
            </Button>
            <Button size="sm" variant="danger" onClick={() => onChange(null)}>
              Xóa
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => setIsPickerOpen(true)}>
            <ImageIcon className="w-4 h-4 mr-1.5" />
            Chọn ảnh
          </Button>
        </div>
      )}

      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        value={value}
        onSelect={img => onChange(img)}
      />
    </div>
  );
}
