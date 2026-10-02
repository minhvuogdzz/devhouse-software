import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('company');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/settings');
      return res.data;
    },
  });

  const [formData, setFormData] = useState({
    companyName: { vi: '', en: '' },
    legalName: { vi: '', en: '' },
    tagline: { vi: '', en: '' },
    contactEmail: '',
    hotline: '',
    taxCode: '',
    address: { vi: '', en: '' },
    workingHours: { vi: '', en: '' },
    socialLinks: [],
    seo: {
      title: { vi: '', en: '' },
      description: { vi: '', en: '' },
      keywords: { vi: '', en: '' },
    },
  });

  useEffect(() => {
    if (settingsData) {
      setFormData({
        companyName: settingsData.companyName || { vi: '', en: '' },
        legalName: settingsData.legalName || { vi: '', en: '' },
        tagline: settingsData.tagline || { vi: '', en: '' },
        contactEmail: settingsData.contactEmail || '',
        hotline: settingsData.hotline || '',
        taxCode: settingsData.taxCode || '',
        address: settingsData.address || { vi: '', en: '' },
        workingHours: settingsData.workingHours || { vi: '', en: '' },
        socialLinks: settingsData.socialLinks || [],
        seo: {
          title: settingsData.seo?.title || { vi: '', en: '' },
          description: settingsData.seo?.description || { vi: '', en: '' },
          keywords: settingsData.seo?.keywords || { vi: '', en: '' },
        },
      });
    }
  }, [settingsData]);

  const saveMutation = useMutation({
    mutationFn: async payload => {
      return apiClient.put('/admin/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const addSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { platform: 'linkedin', url: 'https://' }],
    });
  };

  const updateSocialLink = (index, field, value) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, socialLinks: updated });
  };

  const removeSocialLink = index => {
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return <div className="p-8 text-fg-muted">{t('common.loading')}</div>;
  }

  const tabs = [
    { key: 'company', label: locale === 'vi' ? 'Thông tin công ty' : 'Company Info' },
    { key: 'contact', label: locale === 'vi' ? 'Liên hệ & Trụ sở' : 'Contact & Address' },
    { key: 'social', label: locale === 'vi' ? 'Mạng xã hội' : 'Social Profiles' },
    { key: 'seo', label: locale === 'vi' ? 'SEO mặc định' : 'Default SEO' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg">
            {locale === 'vi' ? 'Cài đặt hệ thống' : 'Site Settings'}
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            {locale === 'vi'
              ? 'Thông tin doanh nghiệp toàn cục, đầu mối liên hệ, liên kết mạng xã hội và siêu dữ liệu SEO.'
              : 'Global enterprise identity, official contacts, social profiles, and default meta tags.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-semibold text-success">
              {locale === 'vi' ? '✓ Đã lưu thay đổi' : '✓ Settings saved'}
            </span>
          )}
          <Button variant="primary" onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'company' && (
        <Card className="space-y-6">
          <LocalizedField
            label={locale === 'vi' ? 'Tên thương hiệu' : 'Brand Name'}
            value={formData.companyName}
            onChange={val => setFormData({ ...formData, companyName: val })}
          />

          <LocalizedField
            label={locale === 'vi' ? 'Tên pháp nhân đầy đủ' : 'Legal Company Name'}
            value={formData.legalName}
            onChange={val => setFormData({ ...formData, legalName: val })}
          />

          <LocalizedField
            label={locale === 'vi' ? 'Khẩu hiệu (Tagline)' : 'Tagline'}
            value={formData.tagline}
            onChange={val => setFormData({ ...formData, tagline: val })}
          />

          <div className="w-full max-w-xs">
            <Input
              label={locale === 'vi' ? 'Mã số thuế (Tax Code)' : 'Tax Registration Code'}
              value={formData.taxCode}
              onChange={e => setFormData({ ...formData, taxCode: e.target.value })}
            />
          </div>
        </Card>
      )}

      {activeTab === 'contact' && (
        <Card className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={locale === 'vi' ? 'Email liên hệ chính thức' : 'Official Contact Email'}
              type="email"
              value={formData.contactEmail}
              onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
            />
            <Input
              label={locale === 'vi' ? 'Hotline tư vấn' : 'Hotline Phone Number'}
              value={formData.hotline}
              onChange={e => setFormData({ ...formData, hotline: e.target.value })}
            />
          </div>

          <LocalizedField
            label={locale === 'vi' ? 'Địa chỉ trụ sở' : 'Office Address'}
            value={formData.address}
            onChange={val => setFormData({ ...formData, address: val })}
          />

          <LocalizedField
            label={locale === 'vi' ? 'Giờ làm việc' : 'Business Hours'}
            value={formData.workingHours}
            onChange={val => setFormData({ ...formData, workingHours: val })}
          />
        </Card>
      )}

      {activeTab === 'social' && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-sm font-semibold text-fg">
              {locale === 'vi' ? 'Hồ sơ mạng xã hội' : 'Official Social Links'}
            </h2>
            <Button variant="secondary" size="sm" onClick={addSocialLink}>
              + {locale === 'vi' ? 'Thêm liên kết' : 'Add Profile'}
            </Button>
          </div>

          <div className="space-y-3">
            {formData.socialLinks.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border border-border bg-surface-raised"
              >
                <div className="w-full sm:w-48">
                  <Input
                    placeholder="Platform (linkedin, github, ...)"
                    value={item.platform}
                    onChange={e => updateSocialLink(index, 'platform', e.target.value)}
                  />
                </div>
                <div className="w-full flex-1">
                  <Input
                    placeholder="URL (https://...)"
                    value={item.url}
                    onChange={e => updateSocialLink(index, 'url', e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:text-danger hover:bg-danger-surface"
                  onClick={() => removeSocialLink(index)}
                >
                  {t('common.delete')}
                </Button>
              </div>
            ))}
            {formData.socialLinks.length === 0 && (
              <p className="text-sm text-fg-muted py-4 text-center">
                {locale === 'vi'
                  ? 'Chưa có liên kết mạng xã hội nào.'
                  : 'No social links configured.'}
              </p>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'seo' && (
        <Card className="space-y-6">
          <LocalizedField
            label={locale === 'vi' ? 'Tiêu đề trang web mặc định' : 'Default Meta Title'}
            value={formData.seo.title}
            onChange={val => setFormData({ ...formData, seo: { ...formData.seo, title: val } })}
          />

          <LocalizedField
            label={locale === 'vi' ? 'Mô tả tóm tắt mặc định' : 'Default Meta Description'}
            type="textarea"
            value={formData.seo.description}
            onChange={val =>
              setFormData({ ...formData, seo: { ...formData.seo, description: val } })
            }
          />

          <LocalizedField
            label={locale === 'vi' ? 'Từ khóa (Keywords)' : 'Default Keywords'}
            value={formData.seo.keywords}
            onChange={val => setFormData({ ...formData, seo: { ...formData.seo, keywords: val } })}
          />
        </Card>
      )}
    </div>
  );
}
