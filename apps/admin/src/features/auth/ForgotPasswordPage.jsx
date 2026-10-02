import React, { useState } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await apiClient('/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-bg text-fg">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold font-display text-fg tracking-tight">
            Khôi phục Mật khẩu
          </h1>
          <p className="text-xs text-fg-muted">
            Nhập email tài khoản quản trị của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-success-subtle text-success flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-fg">Yêu cầu đã được gửi</h2>
              <p className="text-xs text-fg-muted leading-relaxed">
                Nếu email tồn tại trên hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi đến hộp thư
                của bạn (hoặc ghi nhận trong nhật ký hệ thống ở chế độ phát triển).
              </p>
              <Button as={Link} to="/login" variant="primary" size="md" className="w-full">
                Quay lại Đăng nhập
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
                label="Địa chỉ Email"
                type="email"
                required
                placeholder="admin@devhouse.com.vn"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                <Mail className="w-4 h-4 mr-1.5" />
                Gửi liên kết khôi phục
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-fg-muted hover:text-fg gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
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
