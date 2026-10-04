import React from 'react';
import { useRouteError, useNavigate } from 'react-router';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { AlertTriangle } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError();
  const { locale } = useI18n();
  const navigate = useNavigate();

  console.error('Admin Route Error:', error);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="max-w-md w-full text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger/10 text-danger mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-fg">
          {locale === 'vi' ? 'Đã xảy ra lỗi' : 'Application Error'}
        </h1>
        <p className="text-sm text-fg-muted">
          {locale === 'vi'
            ? 'Không thể tải thành phần này. Vui lòng thử tải lại trang hoặc liên hệ quản trị viên.'
            : 'An unexpected error occurred while rendering this view. Please try reloading or return to the dashboard.'}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>
            {locale === 'vi' ? 'Tải lại trang' : 'Reload'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            {locale === 'vi' ? 'Về Bảng điều khiển' : 'Back to Dashboard'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
