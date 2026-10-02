import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Image as ImageIcon, Upload, Trash2, AlertTriangle } from 'lucide-react';

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotConfigured, setIsNotConfigured] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualPublicId, setManualPublicId] = useState('');
  const [alt, setAlt] = useState({ vi: '', en: '' });

  useEffect(() => {
    loadMedia();
  }, []);

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
      setMediaList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetail = asset => {
    setSelectedAsset(asset);
    setAlt(asset.alt || { vi: '', en: '' });
    setIsDetailOpen(true);
  };

  const handleUpdateAlt = async e => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await apiClient(`/admin/media/${selectedAsset._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ alt }),
      });
      setIsDetailOpen(false);
      await loadMedia();
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật thông tin ảnh');
    }
  };

  const handleDelete = async (force = false) => {
    if (!selectedAsset) return;
    if (
      !window.confirm(
        force ? 'Xác nhận ép buộc xóa ảnh này khỏi mọi vị trí sử dụng?' : 'Xóa ảnh này?',
      )
    ) {
      return;
    }

    try {
      const endpoint = force
        ? `/admin/media/${selectedAsset._id}?force=true`
        : `/admin/media/${selectedAsset._id}`;
      await apiClient(endpoint, { method: 'DELETE' });
      setIsDetailOpen(false);
      await loadMedia();
    } catch (err) {
      if (err.status === 409) {
        if (
          window.confirm(
            'Ảnh này đang được sử dụng trong một số bài viết hoặc dịch vụ. Bạn có muốn ÉP BUỘC XÓA (Force delete)?',
          )
        ) {
          handleDelete(true);
        }
      } else {
        alert(err.message || 'Lỗi khi xóa ảnh');
      }
    }
  };

  const handleManualRegister = async e => {
    e.preventDefault();
    try {
      await apiClient('/admin/media', {
        method: 'POST',
        body: JSON.stringify({
          publicId: manualPublicId || `manual-${Date.now()}`,
          url: manualUrl,
          secureUrl: manualUrl,
          width: 1200,
          height: 800,
          format: 'webp',
          resourceType: 'image',
          bytes: 1024,
          alt,
        }),
      });
      setIsUploadOpen(false);
      setManualUrl('');
      setManualPublicId('');
      await loadMedia();
    } catch (err) {
      alert(err.message || 'Không thể đăng ký ảnh');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
            Thư viện Phương tiện (Media Library)
          </h1>
          <p className="text-xs text-fg-muted mt-1">
            Quản lý tài nguyên hình ảnh được lưu trữ trên Cloudinary và kiểm soát vị trí sử dụng
            trong hệ thống.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsUploadOpen(true)}>
          <Upload className="w-4 h-4 mr-1.5" />
          Thêm ảnh mới
        </Button>
      </div>

      {isNotConfigured && (
        <div className="p-4 rounded-xl bg-warning-subtle text-warning border border-warning/20 flex items-start gap-3 text-xs leading-relaxed">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Cloudinary chưa được cấu hình (Chế độ chờ)</p>
            <p>
              Hệ thống đang chạy trong môi trường phát triển chưa có biến môi trường CLOUDINARY_*.
              Bạn có thể đăng ký URL ảnh trực tiếp bên dưới mà không làm gián đoạn trải nghiệm người
              dùng.
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-fg-muted">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Đang tải thư viện ảnh...</p>
        </div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl text-fg-muted">
          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-fg">Chưa có hình ảnh nào</p>
          <p className="text-xs text-fg-subtle mt-1">
            Nhấn "Thêm ảnh mới" để đăng ký tài nguyên ảnh đầu tiên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map(asset => (
            <div
              key={asset._id}
              onClick={() => handleOpenDetail(asset)}
              className="group relative aspect-video bg-surface-sunken border border-border rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors"
            >
              <img
                src={asset.secureUrl || asset.url}
                alt={asset.alt?.vi || asset.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-fg/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                <span className="text-surface text-xs font-semibold line-clamp-2">
                  {asset.alt?.vi || asset.filename || 'Chi tiết'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Thông tin chi tiết hình ảnh"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="danger" size="sm" onClick={() => handleDelete(false)}>
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa ảnh
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
              <Button variant="primary" onClick={handleUpdateAlt}>
                Lưu mô tả
              </Button>
            </div>
          </div>
        }
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-surface-sunken">
              <img
                src={selectedAsset.secureUrl || selectedAsset.url}
                alt={selectedAsset.alt?.vi}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-fg-muted bg-surface-sunken p-3 rounded-xl border border-border">
              <div>
                <span className="text-fg-subtle">Kích thước: </span>
                <span className="font-semibold text-fg">
                  {selectedAsset.width} x {selectedAsset.height} px
                </span>
              </div>
              <div>
                <span className="text-fg-subtle">Dung lượng: </span>
                <span className="font-semibold text-fg">
                  {Math.round((selectedAsset.bytes || 0) / 1024)} KB
                </span>
              </div>
              <div className="col-span-2 truncate">
                <span className="text-fg-subtle">Public ID: </span>
                <span className="font-mono text-fg text-[11px]">{selectedAsset.publicId}</span>
              </div>
            </div>

            <LocalizedField
              label="Mô tả văn bản thay thế (Alt text)"
              value={alt}
              onChange={setAlt}
            />
          </div>
        )}
      </Modal>

      {/* Manual Upload/Register Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Đăng ký hình ảnh mới"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsUploadOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleManualRegister} disabled={!manualUrl}>
              Xác nhận thêm
            </Button>
          </>
        }
      >
        <form onSubmit={handleManualRegister} className="space-y-4">
          <Input
            label="Đường dẫn ảnh trực tiếp (URL)"
            required
            placeholder="https://images.unsplash.com/... hoặc Cloudinary URL"
            value={manualUrl}
            onChange={e => setManualUrl(e.target.value)}
          />

          <Input
            label="Mã định danh ảnh (Public ID - Tùy chọn)"
            placeholder="devhouse/services/banner-1"
            value={manualPublicId}
            onChange={e => setManualPublicId(e.target.value)}
          />

          <LocalizedField label="Mô tả ảnh (Alt text)" value={alt} onChange={setAlt} />
        </form>
      </Modal>
    </div>
  );
}
