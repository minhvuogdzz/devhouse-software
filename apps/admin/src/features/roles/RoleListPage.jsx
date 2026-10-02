import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';

export default function RoleListPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/roles');
      return res.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async id => {
      return apiClient.delete(`/admin/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {locale === 'vi' ? 'Vai trò & Phân quyền' : 'Roles & RBAC'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {locale === 'vi'
              ? 'Định nghĩa các nhóm quyền hạn truy cập theo chuẩn RBAC của hệ thống.'
              : 'Granular permissions and role-based access control matrix definitions.'}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/roles/new')}>
          + {locale === 'vi' ? 'Thêm vai trò' : 'Create Role'}
        </Button>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg">
            <thead className="bg-surface-raised border-b border-border text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Mã vai trò' : 'Role Key'}
                </th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Tên vai trò' : 'Role Name'}
                </th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Số quyền' : 'Permissions'}
                </th>
                <th className="px-6 py-3 font-semibold">{locale === 'vi' ? 'Loại' : 'Type'}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                roles.map(r => {
                  const name = typeof r.name === 'object' ? r.name[locale] || r.name.vi : r.name;
                  return (
                    <tr key={r._id} className="hover:bg-surface-raised transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-fg">
                        <Link
                          to={`/roles/${r._id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {r.key}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-fg">{name}</td>
                      <td className="px-6 py-4 text-xs text-fg-muted">
                        {r.permissions?.includes('*')
                          ? locale === 'vi'
                            ? 'Toàn quyền (*)'
                            : 'Full Access (*)'
                          : `${r.permissions?.length || 0} ${locale === 'vi' ? 'quyền' : 'rules'}`}
                      </td>
                      <td className="px-6 py-4">
                        {r.isSystem ? (
                          <Badge variant="primary">{locale === 'vi' ? 'Hệ thống' : 'System'}</Badge>
                        ) : (
                          <Badge variant="neutral">{locale === 'vi' ? 'Tùy biến' : 'Custom'}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/roles/${r._id}`)}
                        >
                          {t('common.edit')}
                        </Button>
                        {!r.isSystem && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger hover:bg-danger-surface"
                            onClick={() => {
                              if (window.confirm(t('common.confirmDelete'))) {
                                deleteMutation.mutate(r._id);
                              }
                            }}
                          >
                            {t('common.delete')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
