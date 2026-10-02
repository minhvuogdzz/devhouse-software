import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';

export default function RoleEditorPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    key: '',
    name: { vi: '', en: '' },
    description: { vi: '', en: '' },
    permissions: [],
  });
  const [errorMsg, setErrorMsg] = useState('');

  const { data: allPermissions = [] } = useQuery({
    queryKey: ['roles', 'permissions'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/roles/permissions');
      return res.data || [];
    },
  });

  const { data: role, isLoading } = useQuery({
    queryKey: ['roles', id],
    queryFn: async () => {
      if (isNew) return null;
      const res = await apiClient.get(`/admin/roles/${id}`);
      return res.data;
    },
    enabled: !isNew,
  });

  const isSystem = role?.isSystem;

  useEffect(() => {
    if (role) {
      setFormData({
        key: role.key || '',
        name: role.name || { vi: '', en: '' },
        description: role.description || { vi: '', en: '' },
        permissions: role.permissions || [],
      });
    }
  }, [role]);

  // Group permissions by prefix/module
  const groupedPermissions = useMemo(() => {
    const groups = {};
    for (const p of allPermissions) {
      const [module] = p.split(':');
      if (!groups[module]) groups[module] = [];
      groups[module].push(p);
    }
    return groups;
  }, [allPermissions]);

  const saveMutation = useMutation({
    mutationFn: async payload => {
      if (isNew) {
        return apiClient.post('/admin/roles', payload);
      }
      return apiClient.patch(`/admin/roles/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/roles');
    },
    onError: err => {
      setErrorMsg(err.message || 'Error saving role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiClient.delete(`/admin/roles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      navigate('/roles');
    },
    onError: err => {
      setErrorMsg(err.message || 'Error deleting role');
    },
  });

  const handleSubmit = e => {
    e.preventDefault();
    setErrorMsg('');

    if (isSystem) {
      setErrorMsg(
        locale === 'vi'
          ? 'Không thể chỉnh sửa vai trò hệ thống.'
          : 'System roles cannot be modified.',
      );
      return;
    }

    saveMutation.mutate(formData);
  };

  const togglePermission = perm => {
    if (isSystem) return;
    const exists = formData.permissions.includes(perm);
    if (exists) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => p !== perm),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, perm],
      });
    }
  };

  const toggleGroup = groupPerms => {
    if (isSystem) return;
    const allSelected = groupPerms.every(p => formData.permissions.includes(p));
    if (allSelected) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter(p => !groupPerms.includes(p)),
      });
    } else {
      const set = new Set([...formData.permissions, ...groupPerms]);
      setFormData({
        ...formData,
        permissions: Array.from(set),
      });
    }
  };

  if (!isNew && isLoading) {
    return <div className="p-8 text-fg-muted">{t('common.loading')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {isNew
              ? locale === 'vi'
                ? 'Thêm vai trò mới'
                : 'Create Role'
              : locale === 'vi'
                ? 'Chỉnh sửa vai trò'
                : 'Edit Role'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {isSystem
              ? locale === 'vi'
                ? 'Vai trò hệ thống được bảo vệ và không thể chỉnh sửa.'
                : 'Protected system role. Modifications restricted.'
              : locale === 'vi'
                ? 'Gán quyền hạn tương ứng cho nhóm người dùng này.'
                : 'Define granular access rules for this administrative group.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => navigate('/roles')}>
            {t('common.cancel')}
          </Button>
          {!isNew && !isSystem && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (window.confirm(t('common.confirmDelete'))) {
                  deleteMutation.mutate();
                }
              }}
            >
              {t('common.delete')}
            </Button>
          )}
          {!isSystem && (
            <Button type="submit" variant="primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-danger-surface text-danger text-sm">{errorMsg}</div>
      )}

      <Card className="space-y-6">
        <div className="w-full max-w-md">
          <Input
            label={locale === 'vi' ? 'Mã vai trò (Key slug)' : 'Role Key (lowercase slug)'}
            value={formData.key}
            onChange={e =>
              setFormData({
                ...formData,
                key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
              })
            }
            disabled={!isNew}
            required
            placeholder="content_manager"
          />
        </div>

        <LocalizedField
          label={locale === 'vi' ? 'Tên vai trò' : 'Role Name'}
          value={formData.name}
          onChange={val => setFormData({ ...formData, name: val })}
          disabled={isSystem}
        />

        <LocalizedField
          label={locale === 'vi' ? 'Mô tả vai trò' : 'Description'}
          value={formData.description}
          onChange={val => setFormData({ ...formData, description: val })}
          disabled={isSystem}
        />
      </Card>

      <Card className="space-y-6">
        <div>
          <h2 className="text-base font-semibold text-fg">
            {locale === 'vi' ? 'Ma trận quyền hạn (RBAC Matrix)' : 'Permission Matrix'}
          </h2>
          <p className="text-xs text-fg-muted mt-1">
            {locale === 'vi'
              ? 'Tích chọn các quyền hạn tương ứng được cấp phép cho vai trò này.'
              : 'Grant or restrict specific actions across CMS resources.'}
          </p>
        </div>

        {formData.permissions?.includes('*') ? (
          <div className="p-4 rounded-lg bg-primary-surface text-primary text-sm font-medium">
            {locale === 'vi'
              ? '★ Vai trò này sở hữu toàn bộ đặc quyền hệ thống (*).'
              : '★ This role has full unrestricted wildcard access (*).'}
          </div>
        ) : (
          <div className="space-y-6 divide-y divide-border">
            {Object.entries(groupedPermissions).map(([module, perms]) => {
              const allSelected = perms.every(p => formData.permissions.includes(p));
              return (
                <div key={module} className="pt-4 first:pt-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-fg font-mono">
                      {module}
                    </span>
                    {!isSystem && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(perms)}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        {allSelected
                          ? locale === 'vi'
                            ? 'Bỏ chọn nhóm'
                            : 'Deselect group'
                          : locale === 'vi'
                            ? 'Chọn tất cả nhóm'
                            : 'Select group'}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {perms.map(p => {
                      const checked = formData.permissions.includes(p);
                      return (
                        <label
                          key={p}
                          className={`flex items-center gap-2 p-2.5 rounded border text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'border-primary bg-primary-surface/10 font-medium text-fg'
                              : 'border-border bg-surface-raised text-fg-muted hover:border-border-focus'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermission(p)}
                            disabled={isSystem}
                            className="rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="truncate">{p}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </form>
  );
}
