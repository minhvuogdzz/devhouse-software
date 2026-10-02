import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select, Textarea } from '../../components/ui/Input.jsx';
import { ArrowLeft, Mail, Phone, Building, Send, Trash2, MessageSquare } from 'lucide-react';

export default function ContactRequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient(`/admin/contact-requests/${id}`);
      setRequest(res.data);
    } catch {
      alert('Không tìm thấy yêu cầu liên hệ');
      navigate('/contact-requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async newStatus => {
    try {
      await apiClient(`/admin/contact-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setRequest(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      alert(err.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleAddNote = async e => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setIsSubmittingNote(true);
      await apiClient(`/admin/contact-requests/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ body: newNote.trim() }),
      });
      setNewNote('');
      await loadRequest();
    } catch (err) {
      alert(err.message || 'Không thể thêm ghi chú');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu liên hệ này?')) return;
    try {
      await apiClient(`/admin/contact-requests/${id}`, { method: 'DELETE' });
      navigate('/contact-requests');
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa');
    }
  };

  if (isLoading || !request) {
    return (
      <div className="text-center py-20 text-fg-muted">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Đang tải thông tin yêu cầu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button as={Link} to="/contact-requests" variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Danh sách
          </Button>
          <div>
            <h1 className="text-xl font-bold font-display text-fg">
              Chi tiết Yêu cầu từ: {request.name}
            </h1>
            <span className="text-xs text-fg-subtle">
              Nhận lúc: {new Date(request.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Xóa
          </Button>
          <Button
            as="a"
            href={`mailto:${request.email}?subject=Phản hồi từ Dev House Software về yêu cầu dự án`}
            variant="primary"
            size="sm"
          >
            <Mail className="w-4 h-4 mr-1" />
            Gửi email phản hồi
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-fg border-b border-border pb-2">
              Nội dung Yêu cầu Dự án
            </h2>
            <div className="p-4 rounded-xl bg-surface-sunken text-sm text-fg whitespace-pre-wrap leading-relaxed border border-border">
              {request.message}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
              <div>
                <span className="text-fg-subtle block">Dịch vụ quan tâm:</span>
                <span className="font-semibold text-fg">{request.service || 'Chưa chọn'}</span>
              </div>
              <div>
                <span className="text-fg-subtle block">Ngân sách dự kiến:</span>
                <span className="font-semibold text-fg">{request.budget || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-fg-subtle block">Tiến độ mong muốn:</span>
                <span className="font-semibold text-fg">{request.timeline || 'Chưa cung cấp'}</span>
              </div>
              <div>
                <span className="text-fg-subtle block">Ngôn ngữ gửi biểu mẫu:</span>
                <span className="font-semibold text-fg uppercase">{request.locale || 'vi'}</span>
              </div>
            </div>
          </Card>

          {/* Internal Notes Section */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-fg">Ghi chú Nội bộ Đội ngũ</h2>
            </div>

            <div className="space-y-3">
              {!request.notes || request.notes.length === 0 ? (
                <p className="text-xs text-fg-subtle py-2">Chưa có ghi chú nội bộ nào.</p>
              ) : (
                request.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-surface-sunken border border-border text-xs space-y-1"
                  >
                    <p className="text-fg leading-relaxed">{note.body}</p>
                    <span className="text-[10px] text-fg-subtle block">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="space-y-3 pt-2">
              <Textarea
                placeholder="Nhập ghi chú hoặc biên bản trao đổi với khách hàng..."
                rows={2}
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                isLoading={isSubmittingNote}
                disabled={!newNote.trim()}
              >
                <Send className="w-3.5 h-3.5 mr-1" />
                Thêm ghi chú
              </Button>
            </form>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-fg uppercase tracking-wider">Trạng thái Xử lý</h3>
            <Select value={request.status} onChange={e => handleStatusChange(e.target.value)}>
              <option value="new">Mới (New)</option>
              <option value="in_review">Đang xử lý (In review)</option>
              <option value="replied">Đã phản hồi (Replied)</option>
              <option value="closed">Đã đóng (Closed)</option>
              <option value="spam">Đánh dấu Spam</option>
            </Select>
          </Card>

          <Card className="p-5 space-y-3 text-xs">
            <h3 className="text-xs font-bold text-fg uppercase tracking-wider border-b border-border pb-2">
              Thông tin Người gửi
            </h3>

            <div className="flex items-start gap-2 text-fg">
              <Mail className="w-4 h-4 text-fg-subtle shrink-0 mt-0.5" />
              <div className="truncate">
                <span className="text-fg-subtle block text-[10px]">Email:</span>
                <a
                  href={`mailto:${request.email}`}
                  className="text-primary hover:underline truncate"
                >
                  {request.email}
                </a>
              </div>
            </div>

            {request.phone && (
              <div className="flex items-start gap-2 text-fg">
                <Phone className="w-4 h-4 text-fg-subtle shrink-0 mt-0.5" />
                <div>
                  <span className="text-fg-subtle block text-[10px]">Điện thoại:</span>
                  <a href={`tel:${request.phone}`} className="text-fg hover:text-primary">
                    {request.phone}
                  </a>
                </div>
              </div>
            )}

            {request.company && (
              <div className="flex items-start gap-2 text-fg">
                <Building className="w-4 h-4 text-fg-subtle shrink-0 mt-0.5" />
                <div>
                  <span className="text-fg-subtle block text-[10px]">Doanh nghiệp:</span>
                  <span>{request.company}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
