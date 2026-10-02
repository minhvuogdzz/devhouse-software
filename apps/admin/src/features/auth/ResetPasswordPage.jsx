import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient('/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-bg text-fg">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
            Thiết lập Mật khẩu Mới
          </h1>
          <p className="text-xs text-fg-muted">
            Vui lòng nhập mật khẩu mới cho tài khoản quản trị của bạn.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-success-subtle text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-fg">Đổi mật khẩu thành công!</h2>
              <p className="text-xs text-fg-muted">
                Bạn hiện có thể đăng nhập bằng mật khẩu mới vừa thiết lập.
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Đăng nhập ngay
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-danger-subtle text-danger border border-danger/20 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Input
                label="Mật khẩu mới (Tối thiểu 8 ký tự)"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                <Lock className="w-4 h-4 mr-1.5" />
                Lưu mật khẩu mới
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-fg-muted hover:text-fg">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
