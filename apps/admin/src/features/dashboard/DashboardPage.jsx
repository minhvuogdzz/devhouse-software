import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Inbox, Layers, Briefcase, BookOpen, ArrowRight, Plus, Activity } from 'lucide-react';

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient('/admin/dashboard');
      setData(res.data || null);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const counts = data?.counts || {
    services: 0,
    solutions: 0,
    projects: 0,
    posts: 0,
    contacts: 0,
    newContacts: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-fg tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs text-fg-muted mt-1">{t('dashboard.subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button as={Link} to="/services/new" variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {locale === 'en' ? 'New Service' : 'Tạo Dịch vụ'}
          </Button>
          <Button as={Link} to="/blog/posts/new" variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            {locale === 'en' ? 'New Article' : 'Viết bài mới'}
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Inquiries (Most Prominent) */}
        <Card className="p-5 border-primary/30 bg-primary-subtle/20 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {t('dashboard.newContacts')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-fg flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-display text-fg">
              {counts.newContacts || 0}
            </div>
            <p className="text-xs text-fg-muted">
              {locale === 'en' ? 'Awaiting response from team' : 'Đang chờ xử lý và phản hồi'}
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-primary/20">
            <Link
              to="/contact-requests"
              className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-hover gap-1"
            >
              <span>{locale === 'en' ? 'Open Inbox' : 'Mở Hộp thư'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Services Count */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg-subtle uppercase tracking-wider">
                {t('dashboard.totalServices')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-sunken text-fg-muted flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-display text-fg">
              {counts.services || 0}
            </div>
            <p className="text-xs text-fg-muted">
              {locale === 'en' ? 'Catalog offerings' : 'Gói dịch vụ kỹ thuật'}
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-border">
            <Link
              to="/services"
              className="inline-flex items-center text-xs font-semibold text-fg-muted hover:text-fg gap-1"
            >
              <span>{t('common.preview')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Projects Count */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg-subtle uppercase tracking-wider">
                {t('dashboard.totalProjects')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-sunken text-fg-muted flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-display text-fg">
              {counts.projects || 0}
            </div>
            <p className="text-xs text-fg-muted">
              {locale === 'en' ? 'Published case studies' : 'Dự án thực tế'}
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-border">
            <Link
              to="/projects"
              className="inline-flex items-center text-xs font-semibold text-fg-muted hover:text-fg gap-1"
            >
              <span>{t('common.preview')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>

        {/* Blog Posts Count */}
        <Card className="p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg-subtle uppercase tracking-wider">
                {t('dashboard.totalPosts')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-surface-sunken text-fg-muted flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-display text-fg">{counts.posts || 0}</div>
            <p className="text-xs text-fg-muted">
              {locale === 'en' ? 'Technical insights' : 'Bài viết góc nhìn công nghệ'}
            </p>
          </div>
          <div className="pt-4 mt-2 border-t border-border">
            <Link
              to="/blog/posts"
              className="inline-flex items-center text-xs font-semibold text-fg-muted hover:text-fg gap-1"
            >
              <span>{t('common.preview')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Two-Column Activity & Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-fg">{t('dashboard.recentContacts')}</h2>
            </div>
            <Link
              to="/contact-requests"
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Xem tất cả
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-xs text-fg-muted">Đang tải...</div>
          ) : !data?.recentContacts || data.recentContacts.length === 0 ? (
            <div className="text-center py-8 text-xs text-fg-muted border border-dashed border-border rounded-lg">
              Chưa có yêu cầu liên hệ mới nào.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.recentContacts.slice(0, 5).map(c => (
                <div key={c._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 truncate">
                    <p className="font-bold text-fg truncate">{c.name}</p>
                    <p className="text-fg-subtle truncate">
                      {c.email} {c.company ? `• ${c.company}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <Badge variant={c.status === 'new' ? 'default' : 'secondary'}>{c.status}</Badge>
                    <Link
                      to={`/contact-requests/${c._id}`}
                      className="p-1 rounded text-fg-muted hover:text-fg"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Audit Activity */}
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-fg">{t('dashboard.recentActivity')}</h2>
            </div>
            <Link
              to="/audit-logs"
              className="text-xs font-semibold text-primary hover:text-primary-hover"
            >
              Xem tất cả
            </Link>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-xs text-fg-muted">Đang tải...</div>
          ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-xs text-fg-muted border border-dashed border-border rounded-lg">
              Chưa có nhật ký hoạt động gần đây.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.recentActivity.slice(0, 5).map(act => (
                <div key={act._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 truncate">
                    <p className="font-semibold text-fg truncate">
                      <span className="text-primary font-bold">{act.action}</span>
                      {act.resource?.type ? ` on ${act.resource.type}` : ''}
                    </p>
                    <p className="text-fg-subtle truncate">
                      {act.actor?.name || act.actor?.email || 'System'}
                    </p>
                  </div>
                  <span className="text-[10px] text-fg-subtle shrink-0">
                    {new Date(act.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
