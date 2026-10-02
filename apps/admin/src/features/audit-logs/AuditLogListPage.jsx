import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input, Select } from '../../components/ui/Input.jsx';
import { Modal } from '../../components/ui/Modal.jsx';

export default function AuditLogListPage() {
  const { t, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const queryParams = new URLSearchParams();
  queryParams.set('page', page);
  queryParams.set('limit', 20);
  if (actionFilter) queryParams.set('action', actionFilter);
  if (resourceFilter) queryParams.set('resourceType', resourceFilter);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, actionFilter, resourceFilter],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/audit-logs?${queryParams.toString()}`);
      return res;
    },
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {locale === 'vi' ? 'Nhật ký Kiểm toán (Audit Logs)' : 'System Audit Logs'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {locale === 'vi'
              ? 'Ghi vết bất biến toàn bộ hoạt động đăng nhập, chỉnh sửa nội dung và cấu hình hệ thống.'
              : 'Immutable record of security events, administrative modifications, and access traces.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          placeholder={
            locale === 'vi' ? 'Tìm theo hành động (auth, service...)' : 'Filter by action...'
          }
          value={actionFilter}
          onChange={e => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        />
        <Select
          value={resourceFilter}
          onChange={e => {
            setResourceFilter(e.target.value);
            setPage(1);
          }}
          options={[
            { value: '', label: locale === 'vi' ? 'Tất cả tài nguyên' : 'All Resources' },
            { value: 'service', label: 'Service' },
            { value: 'solution', label: 'Solution' },
            { value: 'project', label: 'Project' },
            { value: 'technology', label: 'Technology' },
            { value: 'post', label: 'Post' },
            { value: 'page', label: 'Page' },
            { value: 'user', label: 'User' },
            { value: 'role', label: 'Role' },
            { value: 'setting', label: 'Setting' },
            { value: 'redirect', label: 'Redirect' },
            { value: 'media', label: 'Media' },
          ]}
        />
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg">
            <thead className="bg-surface-raised border-b border-border text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Thời gian' : 'Timestamp'}
                </th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Tài khoản' : 'Actor'}
                </th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Hành động' : 'Action'}
                </th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Tài nguyên' : 'Resource'}
                </th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Kết quả' : 'Outcome'}
                </th>
                <th className="px-6 py-3 font-semibold text-right">
                  {locale === 'vi' ? 'Chi tiết' : 'Details'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-surface-raised transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-fg-muted whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 font-medium text-fg">
                      {log.actor?.email || log.actor?.name || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-surface-raised border border-border text-fg">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-fg-muted">
                      {log.resource?.type && (
                        <span className="font-semibold text-fg">{log.resource.type}: </span>
                      )}
                      {log.resource?.label || log.resource?.id || '—'}
                    </td>
                    <td className="px-6 py-4">
                      {log.outcome === 'failure' ? (
                        <Badge variant="danger">Failed</Badge>
                      ) : (
                        <Badge variant="success">Success</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                        {locale === 'vi' ? 'Xem' : 'View'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-surface-raised">
            <span className="text-xs text-fg-muted">
              {locale === 'vi'
                ? `Trang ${pagination.page} / ${pagination.totalPages} (${pagination.total} bản ghi)`
                : `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} entries)`}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                ←
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setPage(p => p + 1)}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={locale === 'vi' ? 'Chi tiết sự kiện kiểm toán' : 'Audit Event Details'}
      >
        {selectedLog && (
          <div className="space-y-4 text-sm text-fg">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-border">
              <div>
                <span className="text-xs text-fg-muted block">
                  {locale === 'vi' ? 'Thời gian' : 'Time'}
                </span>
                <span className="font-mono text-xs">
                  {new Date(selectedLog.createdAt).toISOString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-fg-muted block">
                  {locale === 'vi' ? 'Hành động' : 'Action'}
                </span>
                <span className="font-mono text-xs font-semibold">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-xs text-fg-muted block">
                  {locale === 'vi' ? 'Người thực hiện' : 'Actor'}
                </span>
                <span>{selectedLog.actor?.email || selectedLog.actor?.id || 'System'}</span>
              </div>
              <div>
                <span className="text-xs text-fg-muted block">
                  {locale === 'vi' ? 'Địa chỉ IP' : 'IP Address'}
                </span>
                <span className="font-mono text-xs">{selectedLog.ip || '—'}</span>
              </div>
              {selectedLog.requestId && (
                <div className="col-span-2">
                  <span className="text-xs text-fg-muted block">Request ID</span>
                  <span className="font-mono text-xs">{selectedLog.requestId}</span>
                </div>
              )}
            </div>

            {selectedLog.changes && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted block mb-1">
                  {locale === 'vi' ? 'Dữ liệu thay đổi (Changes)' : 'Recorded Changes'}
                </span>
                <pre className="p-3 rounded bg-surface-raised border border-border text-xs font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.changes, null, 2)}
                </pre>
              </div>
            )}

            {selectedLog.metadata && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted block mb-1">
                  Metadata
                </span>
                <pre className="p-3 rounded bg-surface-raised border border-border text-xs font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
