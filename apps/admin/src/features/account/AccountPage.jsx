import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context.jsx';
import { useI18n } from '../../lib/i18n.jsx';
import { apiClient } from '../../lib/api-client.js';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { t, locale } = useI18n();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleChangePassword = async e => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (newPassword.length < 8) {
      setStatusMsg({
        type: 'danger',
        text:
          locale === 'vi'
            ? 'Mật khẩu mới phải có ít nhất 8 ký tự'
            : 'New password must be at least 8 characters long',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({
        type: 'danger',
        text:
          locale === 'vi' ? 'Mật khẩu xác nhận không khớp' : 'Password confirmation does not match',
      });
      return;
    }

    setIsChanging(true);
    try {
      await apiClient.post('/auth/password/change', {
        currentPassword,
        newPassword,
      });
      setStatusMsg({
        type: 'success',
        text: locale === 'vi' ? 'Đổi mật khẩu thành công!' : 'Password updated successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatusMsg({
        type: 'danger',
        text: err.message || (locale === 'vi' ? 'Đổi mật khẩu thất bại' : 'Password change failed'),
      });
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-fg">
          {locale === 'vi' ? 'Hồ sơ & Tài khoản của tôi' : 'My Profile & Account'}
        </h1>
        <p className="text-sm text-fg-muted mt-1">
          {locale === 'vi'
            ? 'Thông tin định danh người dùng và quản lý mật khẩu bảo mật.'
            : 'User identity details, assigned permissions, and credential security.'}
        </p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-base font-semibold text-fg">
          {locale === 'vi' ? 'Thông tin cá nhân' : 'Personal Information'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-fg-muted block mb-0.5">
              {locale === 'vi' ? 'Họ và tên' : 'Full Name'}
            </span>
            <span className="font-semibold text-fg">{user?.name || '—'}</span>
          </div>
          <div>
            <span className="text-xs text-fg-muted block mb-0.5">Email</span>
            <span className="font-semibold text-fg">{user?.email || '—'}</span>
          </div>
          <div>
            <span className="text-xs text-fg-muted block mb-0.5">
              {locale === 'vi' ? 'Vai trò' : 'Roles'}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {user?.roleKeys?.map(rk => (
                <Badge key={rk} variant="primary">
                  {rk}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-fg-muted block mb-0.5">{t('common.status')}</span>
            <Badge variant="success">Active</Badge>
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-base font-semibold text-fg">
          {locale === 'vi' ? 'Đổi mật khẩu tài khoản' : 'Change Password'}
        </h2>
        <p className="text-xs text-fg-muted">
          {locale === 'vi'
            ? 'Sau khi đổi mật khẩu thành công, các phiên làm việc trên các thiết bị khác sẽ tự động đăng xuất.'
            : 'After changing password, all active sessions on other browsers will be revoked.'}
        </p>

        {statusMsg.text && (
          <div
            className={`p-3 rounded text-sm ${
              statusMsg.type === 'success'
                ? 'bg-success-surface text-success'
                : 'bg-danger-surface text-danger'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label={locale === 'vi' ? 'Mật khẩu hiện tại' : 'Current Password'}
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label={
              locale === 'vi' ? 'Mật khẩu mới (tối thiểu 8 ký tự)' : 'New Password (min 8 chars)'
            }
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />

          <Input
            label={locale === 'vi' ? 'Xác nhận mật khẩu mới' : 'Confirm New Password'}
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" disabled={isChanging}>
              {isChanging
                ? locale === 'vi'
                  ? 'Đang cập nhật...'
                  : 'Updating...'
                : locale === 'vi'
                  ? 'Cập nhật mật khẩu'
                  : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-base font-semibold text-fg">
          {locale === 'vi' ? 'Phiên làm việc' : 'Active Session'}
        </h2>
        <p className="text-xs text-fg-muted">
          {locale === 'vi'
            ? 'Đăng xuất khỏi bảng điều khiển quản trị Dev House CMS.'
            : 'Sign out of the current Dev House administration session.'}
        </p>
        <div>
          <Button variant="danger" onClick={logout}>
            {t('common.logout')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
