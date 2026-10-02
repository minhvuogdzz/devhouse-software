import React from 'react';
import { useNavigate } from 'react-router';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';

export default function ForbiddenPage() {
  const { locale } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center space-y-4 py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-danger-surface text-danger text-xl font-bold">
          403
        </div>
        <h1 className="text-xl font-bold text-fg">
          {locale === 'vi' ? 'Không có quyền truy cập' : 'Access Denied'}
        </h1>
        <p className="text-sm text-fg-muted">
          {locale === 'vi'
            ? 'Tài khoản của bạn không được phân quyền để thực hiện hoặc xem tài nguyên này.'
            : 'Your assigned role does not grant the required RBAC permissions to access this screen.'}
        </p>
        <div className="pt-2">
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            {locale === 'vi' ? 'Quay lại Bảng điều khiển' : 'Return to Dashboard'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
