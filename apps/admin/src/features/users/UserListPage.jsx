import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { useAuth } from '../../lib/auth-context.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';

export default function UserListPage() {
  const { t, locale } = useI18n();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async id => {
      return apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.name?.toLowerCase().includes(q) ||
      u.roleKeys?.some(r => r.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {locale === 'vi' ? 'Quản lý Người dùng' : 'User Accounts'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {locale === 'vi'
              ? 'Danh sách tài khoản quản trị viên, biên tập viên và phân quyền vai trò.'
              : 'Administrative staff, content editors, and role-based privilege assignments.'}
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/users/new')}>
          + {locale === 'vi' ? 'Thêm người dùng' : 'Create User'}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-full max-w-sm">
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-fg">
            <thead className="bg-surface-raised border-b border-border text-xs uppercase tracking-wider text-fg-muted">
              <tr>
                <th className="px-6 py-3 font-semibold">{locale === 'vi' ? 'Tên' : 'Name'}</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">{locale === 'vi' ? 'Vai trò' : 'Roles'}</th>
                <th className="px-6 py-3 font-semibold">{t('common.status')}</th>
                <th className="px-6 py-3 font-semibold">
                  {locale === 'vi' ? 'Đăng nhập gần nhất' : 'Last Login'}
                </th>
                <th className="px-6 py-3 font-semibold text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-fg-muted">
                    {t('common.noData')}
                  </td>
                </tr>
              ) : (
                filtered.map(u => {
                  const isSelf = currentUser?._id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-surface-raised transition-colors">
                      <td className="px-6 py-4 font-medium text-fg">
                        <Link
                          to={`/users/${u._id}`}
                          className="hover:text-primary transition-colors font-semibold"
                        >
                          {u.name}
                        </Link>
                        {isSelf && (
                          <span className="ml-2 text-xs bg-primary-surface text-primary font-medium px-2 py-0.5 rounded">
                            {locale === 'vi' ? 'Bạn' : 'You'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-fg-muted">{u.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roleKeys?.map(rk => (
                            <span
                              key={rk}
                              className="text-xs px-2 py-0.5 rounded bg-surface-raised border border-border text-fg-muted"
                            >
                              {rk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.status === 'active' ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="danger">Disabled</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-fg-muted">
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString(
                              locale === 'vi' ? 'vi-VN' : 'en-US',
                            )
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/users/${u._id}`)}
                        >
                          {t('common.edit')}
                        </Button>
                        {!isSelf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger hover:bg-danger-surface"
                            onClick={() => {
                              if (window.confirm(t('common.confirmDelete'))) {
                                deleteMutation.mutate(u._id);
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
