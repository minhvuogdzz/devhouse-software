import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client.js';
import { diffAgainstDefaults } from '../../lib/content-diff.js';
import { useI18n } from '../../lib/i18n.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Input, Textarea, Select } from '../../components/ui/Input.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { LocalizedField } from '../../components/form/LocalizedField.jsx';
import { Toggle } from '../../components/form/Toggle.jsx';
import { Sparkles, Eye, EyeOff, FileText, Upload, Share2, PhoneCall, Plus, Trash2, RotateCcw } from 'lucide-react';

const DEFAULT_SOCIAL_TEMPLATES = [
  { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/devhousesoftware', enabled: true },
  { platform: 'zalo', label: 'Zalo', url: 'https://zalo.me/0869528304', enabled: true },
  { platform: 'telegram', label: 'Telegram', url: 'https://t.me/devhousesoftware', enabled: true },
  { platform: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/@devhousesoftware', enabled: true },
  { platform: 'youtube', label: 'YouTube', url: 'https://youtube.com/@devhousesoftware', enabled: true },
  { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/devhousesoftware', enabled: true },
  { platform: 'github', label: 'GitHub', url: 'https://github.com/thedevhouse', enabled: true },
];

const DEFAULT_FLOATING_CONTACTS = [
  { type: 'zalo', label: 'Zalo tư vấn', value: 'https://zalo.me/0869528304', enabled: true },
  { type: 'phone', label: 'Hotline 0869 528 304', value: '0869528304', enabled: true },
  { type: 'messenger', label: 'Messenger', value: 'https://m.me/devhousesoftware', enabled: true },
];

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('company');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

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
    socialLinks: DEFAULT_SOCIAL_TEMPLATES,
    floatingContacts: DEFAULT_FLOATING_CONTACTS,
    seo: {
      title: { vi: '', en: '' },
      description: { vi: '', en: '' },
      keywords: { vi: '', en: '' },
    },
    ai: {
      enabled: true,
      apiKey: '',
      apiKeys: [{ key: '', label: 'Key #1', enabled: true }],
      model: 'gemini-flash-lite-latest',
      companyKnowledge: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      const r = settingsData.resolved || settingsData;
      const loadedApiKeys =
        Array.isArray(r.ai?.apiKeys) && r.ai.apiKeys.length > 0
          ? r.ai.apiKeys.map((item, idx) =>
              typeof item === 'string'
                ? { key: item, label: `Key #${idx + 1}`, enabled: true }
                : {
                    key: item?.key || '',
                    label: item?.label || `Key #${idx + 1}`,
                    enabled: item?.enabled !== false,
                  },
            )
          : r.ai?.apiKey
            ? [{ key: r.ai.apiKey, label: 'Key #1 (Chính)', enabled: true }]
            : [{ key: '', label: 'Key #1', enabled: true }];

      setFormData({
        companyName: r.companyName || { vi: '', en: '' },
        legalName: r.legalName || { vi: '', en: '' },
        tagline: r.tagline || { vi: '', en: '' },
        contactEmail: r.contactEmail || '',
        hotline: r.hotline || '',
        taxCode: r.taxCode || '',
        address: r.address || { vi: '', en: '' },
        workingHours: r.workingHours || { vi: '', en: '' },
        socialLinks:
          Array.isArray(r.socialLinks) && r.socialLinks.length > 0
            ? r.socialLinks
            : DEFAULT_SOCIAL_TEMPLATES,
        floatingContacts:
          Array.isArray(r.floatingContacts) && r.floatingContacts.length > 0
            ? r.floatingContacts
            : DEFAULT_FLOATING_CONTACTS,
        seo: {
          title: r.seo?.title || { vi: '', en: '' },
          description: r.seo?.description || { vi: '', en: '' },
          keywords: r.seo?.keywords || { vi: '', en: '' },
        },
        ai: {
          enabled: r.ai?.enabled !== false,
          apiKey: r.ai?.apiKey || loadedApiKeys.find(k => k.enabled !== false && k.key)?.key || '',
          apiKeys: loadedApiKeys,
          model: r.ai?.model || 'gemini-flash-lite-latest',
          companyKnowledge: r.ai?.companyKnowledge || '',
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
    const cleanedKeys = (formData.ai?.apiKeys || [])
      .map((item, idx) => ({
        key: (item.key || '').trim(),
        label: (item.label || `Key #${idx + 1}`).trim(),
        enabled: item.enabled !== false,
      }))
      .filter(item => item.key.length > 0);

    const primaryKey =
      cleanedKeys.find(item => item.enabled && item.key)?.key ||
      cleanedKeys[0]?.key ||
      (formData.ai?.apiKey || '').trim();

    const normalizedFormData = {
      ...formData,
      ai: {
        ...formData.ai,
        apiKey: primaryKey,
        apiKeys: cleanedKeys,
      },
    };

    // Only what differs from the built-in defaults is stored.
    const defaults = settingsData?.defaults || {};
    saveMutation.mutate(diffAgainstDefaults(normalizedFormData, defaults) || {});
  };

  const addApiKey = () => {
    setFormData(prev => {
      const current = Array.isArray(prev.ai?.apiKeys) ? prev.ai.apiKeys : [];
      return {
        ...prev,
        ai: {
          ...prev.ai,
          apiKeys: [
            ...current,
            { key: '', label: `Key #${current.length + 1}`, enabled: true },
          ],
        },
      };
    });
  };

  const updateApiKey = (index, field, value) => {
    setFormData(prev => {
      const current = [...(prev.ai?.apiKeys || [])];
      // Support pasting multiple keys separated by newline, comma, or semicolon
      if (field === 'key' && typeof value === 'string' && /[\n,;]/.test(value)) {
        const parts = value
          .split(/[\n,;]+/)
          .map(s => s.trim())
          .filter(Boolean);
        if (parts.length > 1) {
          const newEntries = parts.map((k, idx) => ({
            key: k,
            label: idx === 0 && current[index]?.label ? current[index].label : `Key #${index + idx + 1}`,
            enabled: true,
          }));
          current.splice(index, 1, ...newEntries);
          const firstEnabled = current.find(item => item.enabled !== false && item.key)?.key || '';
          return {
            ...prev,
            ai: {
              ...prev.ai,
              apiKey: firstEnabled,
              apiKeys: current,
            },
          };
        }
      }

      current[index] = { ...current[index], [field]: value };
      const firstEnabled = current.find(item => item.enabled !== false && item.key)?.key || '';
      return {
        ...prev,
        ai: {
          ...prev.ai,
          apiKey: firstEnabled,
          apiKeys: current,
        },
      };
    });
  };

  const removeApiKey = index => {
    setFormData(prev => {
      const filtered = (prev.ai?.apiKeys || []).filter((_, i) => i !== index);
      const nextKeys =
        filtered.length > 0 ? filtered : [{ key: '', label: 'Key #1', enabled: true }];
      const firstEnabled = nextKeys.find(item => item.enabled !== false && item.key)?.key || '';
      return {
        ...prev,
        ai: {
          ...prev.ai,
          apiKey: firstEnabled,
          apiKeys: nextKeys,
        },
      };
    });
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { platform: 'facebook', label: 'Facebook', url: 'https://', enabled: true },
      ],
    }));
  };

  const updateSocialLink = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.socialLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, socialLinks: updated };
    });
  };

  const removeSocialLink = index => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const loadDefaultSocialLinks = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: DEFAULT_SOCIAL_TEMPLATES,
    }));
  };

  const addFloatingContact = () => {
    setFormData(prev => ({
      ...prev,
      floatingContacts: [
        ...(prev.floatingContacts || []),
        { type: 'phone', label: 'Hotline', value: '', enabled: true },
      ],
    }));
  };

  const updateFloatingContact = (index, field, value) => {
    setFormData(prev => {
      const updated = [...(prev.floatingContacts || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, floatingContacts: updated };
    });
  };

  const removeFloatingContact = index => {
    setFormData(prev => ({
      ...prev,
      floatingContacts: (prev.floatingContacts || []).filter((_, i) => i !== index),
    }));
  };

  const loadDefaultFloatingContacts = () => {
    setFormData(prev => ({
      ...prev,
      floatingContacts: DEFAULT_FLOATING_CONTACTS,
    }));
  };

  const handleKnowledgeFileUpload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setFormData(prev => ({
          ...prev,
          ai: {
            ...prev.ai,
            companyKnowledge: prev.ai.companyKnowledge
              ? `${prev.ai.companyKnowledge}\n\n${content}`
              : content,
          },
        }));
      }
    };
    reader.readAsText(file);
  };

  const handleFillTemplate = () => {
    const template = `# TỔNG QUAN NĂNG LỰC & QUY TRÌNH DEVHOUSE SOFTWARE

## 1. Giới thiệu doanh nghiệp
Devhouse Software là đơn vị công nghệ thành viên của Devhouse Group, chuyên cung cấp giải pháp chuyển đổi số toàn diện, thiết kế website cao cấp chuẩn doanh nghiệp, hạ tầng máy chủ đám mây tốc độ cao và bảo mật dữ liệu an toàn.

## 2. Các dịch vụ & năng lực cốt lõi
- Xây dựng website thương mại điện tử, landing page giới thiệu công ty, web app chuyên sâu.
- Cung cấp hạ tầng máy chủ đám mây, sao lưu tự động hàng ngày, tường lửa WAF chống tấn công DDoS.
- Đăng ký và quản trị tên miền chính thức, cấp phát chứng chỉ SSL cao cấp.
- Bảo trì, xử lý sự cố kỹ thuật 24/7 và giám sát uptime 99.9%.

## 3. Quy trình làm việc 6 bước chuẩn mực
1. Tiếp nhận & Tư vấn giải pháp phù hợp ngân sách.
2. Lập bản mô tả chức năng & Ký hợp đồng rõ ràng.
3. Thiết kế giao diện (UI/UX) độc quyền hoặc tinh chỉnh từ mẫu chuẩn.
4. Lập trình tính năng, tích hợp cổng thanh toán và vận chuyển.
5. Kiểm thử bảo mật (UAT, bảo mật OWASP, tối ưu PageSpeed).
6. Bàn giao source code, hướng dẫn sử dụng và hỗ trợ bảo hành trọn đời.

## 4. Cam kết chất lượng & Hỗ trợ kỹ thuật
- Miễn phí nâng cấp vá lỗi bảo mật định kỳ.
- Đội ngũ kỹ sư hỗ trợ phản hồi trong vòng 15-30 phút qua hotline và nhóm hỗ trợ riêng.
- Bàn giao đầy đủ quyền quản trị và cơ sở dữ liệu cho khách hàng.`;

    setFormData(prev => ({
      ...prev,
      ai: {
        ...prev.ai,
        companyKnowledge: template,
      },
    }));
  };

  if (isLoading) {
    return <div className="p-8 text-fg-muted">{t('common.loading')}</div>;
  }

  const tabs = [
    { key: 'company', label: locale === 'vi' ? 'Thông tin công ty' : 'Company Info' },
    { key: 'contact', label: locale === 'vi' ? 'Liên hệ & Trụ sở' : 'Contact & Address' },
    { key: 'social', label: locale === 'vi' ? 'Mạng xã hội & Nút nổi' : 'Social & Floating' },
    { key: 'seo', label: locale === 'vi' ? 'SEO mặc định' : 'Default SEO' },
    { key: 'ai', label: locale === 'vi' ? 'Trí tuệ nhân tạo (DH AI)' : 'DH AI Assistant' },
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
        <div className="space-y-6">
          {/* Section 1: 3 Floating Contacts */}
          <Card className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-semibold text-fg">
                    {locale === 'vi'
                      ? '3 Nút liên hệ nổi (Floating Contacts)'
                      : '3 Floating Action Contacts'}
                  </h2>
                </div>
                <p className="text-xs text-fg-muted mt-1 max-w-2xl">
                  {locale === 'vi'
                    ? 'Xuất hiện ở góc dưới bên phải màn hình. Khi người dùng cuộn xuống chân trang (Footer), 3 nút này sẽ tự động thu xuống dưới và nút Chatbot DH AI sẽ trượt xuống chiếm chỗ trống.'
                    : 'Fixed at the bottom-right viewport. Retracts smoothly when reaching the footer so the DH AI Chatbot slides down.'}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDefaultFloatingContacts}
                  title={locale === 'vi' ? 'Khôi phục 3 nút mẫu' : 'Reset to standard'}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  {locale === 'vi' ? 'Mặc định' : 'Defaults'}
                </Button>
                <Button variant="secondary" size="sm" onClick={addFloatingContact}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {locale === 'vi' ? 'Thêm nút' : 'Add Button'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {(formData.floatingContacts || []).map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3.5 rounded-xl border border-border bg-surface-raised"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="w-44 shrink-0">
                      <Select
                        value={item.type || 'phone'}
                        onChange={e => updateFloatingContact(index, 'type', e.target.value)}
                      >
                        <option value="zalo">Zalo Chat</option>
                        <option value="phone">Hotline / Điện thoại</option>
                        <option value="messenger">Facebook Messenger</option>
                        <option value="telegram">Telegram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="custom">Tùy chỉnh (Link)</option>
                      </Select>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder={
                        locale === 'vi' ? 'Nhãn hiển thị (ví dụ: Zalo tư vấn)' : 'Display label'
                      }
                      value={item.label || ''}
                      onChange={e => updateFloatingContact(index, 'label', e.target.value)}
                    />
                    <Input
                      placeholder={
                        item.type === 'phone'
                          ? 'Số điện thoại (0869...)'
                          : 'URL (https://zalo.me/... hoặc https://m.me/...)'
                      }
                      value={item.value || ''}
                      onChange={e => updateFloatingContact(index, 'value', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={item.enabled !== false}
                        onChange={checked => updateFloatingContact(index, 'enabled', checked)}
                      />
                      <span className="text-xs text-fg-muted whitespace-nowrap">
                        {item.enabled !== false
                          ? locale === 'vi'
                            ? 'Hiển thị'
                            : 'Active'
                          : locale === 'vi'
                            ? 'Ẩn'
                            : 'Hidden'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:text-danger hover:bg-danger-surface"
                      onClick={() => removeFloatingContact(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {(formData.floatingContacts || []).length === 0 && (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <p className="text-sm text-fg-muted">
                    {locale === 'vi'
                      ? 'Chưa có nút nổi nào được kích hoạt.'
                      : 'No floating action buttons configured.'}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={loadDefaultFloatingContacts}
                  >
                    {locale === 'vi' ? 'Khôi phục 3 nút mẫu' : 'Load defaults'}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Section 2: Footer Social Channels */}
          <Card className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-semibold text-fg">
                    {locale === 'vi'
                      ? 'Mạng xã hội ở Chân trang (Footer Social)'
                      : 'Footer Official Social Channels'}
                  </h2>
                </div>
                <p className="text-xs text-fg-muted mt-1 max-w-2xl">
                  {locale === 'vi'
                    ? 'Hiển thị danh sách đầy đủ các kênh mạng xã hội chính thức của Devhouse ở chân trang (Footer).'
                    : 'All official social network profiles displayed at the bottom footer of the website.'}
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDefaultSocialLinks}
                  title={locale === 'vi' ? 'Nạp danh sách chuẩn' : 'Load default channels'}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  {locale === 'vi' ? 'Nạp 7 kênh chuẩn' : 'Load 7 channels'}
                </Button>
                <Button variant="secondary" size="sm" onClick={addSocialLink}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {locale === 'vi' ? 'Thêm kênh' : 'Add Channel'}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {formData.socialLinks.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-3.5 rounded-xl border border-border bg-surface-raised"
                >
                  <div className="w-full sm:w-48 shrink-0">
                    <Select
                      value={item.platform || 'facebook'}
                      onChange={e => updateSocialLink(index, 'platform', e.target.value)}
                    >
                      <option value="facebook">Facebook</option>
                      <option value="zalo">Zalo</option>
                      <option value="telegram">Telegram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="youtube">YouTube</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="github">GitHub</option>
                      <option value="x">X (Twitter)</option>
                      <option value="instagram">Instagram</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="threads">Threads</option>
                      <option value="discord">Discord</option>
                    </Select>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      placeholder="Tên kênh (Facebook, Zalo, ...)"
                      value={item.label || ''}
                      onChange={e => updateSocialLink(index, 'label', e.target.value)}
                    />
                    <Input
                      placeholder="URL (https://...)"
                      value={item.url || ''}
                      onChange={e => updateSocialLink(index, 'url', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                    <div className="flex items-center gap-2">
                      <Toggle
                        checked={item.enabled !== false}
                        onChange={checked => updateSocialLink(index, 'enabled', checked)}
                      />
                      <span className="text-xs text-fg-muted whitespace-nowrap">
                        {item.enabled !== false
                          ? locale === 'vi'
                            ? 'Bật'
                            : 'Active'
                          : locale === 'vi'
                            ? 'Tắt'
                            : 'Off'}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-danger hover:text-danger hover:bg-danger-surface"
                      onClick={() => removeSocialLink(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {formData.socialLinks.length === 0 && (
                <div className="text-center py-6 border border-dashed border-border rounded-xl">
                  <p className="text-sm text-fg-muted">
                    {locale === 'vi'
                      ? 'Chưa có liên kết mạng xã hội nào.'
                      : 'No social links configured.'}
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={loadDefaultSocialLinks}
                  >
                    {locale === 'vi' ? 'Nạp 7 kênh chuẩn' : 'Load default channels'}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
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

      {activeTab === 'ai' && (
        <Card className="space-y-6">
          <div className="flex items-start justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-fg">
                  {locale === 'vi' ? 'Hệ thống Trí tuệ Nhân tạo DH AI' : 'DH AI Intelligent System'}
                </h2>
                <p className="text-xs text-fg-muted mt-0.5">
                  {locale === 'vi'
                    ? 'Cấu hình khóa kết nối, mô hình tính toán và nạp kho dữ liệu tri thức nội bộ cho trợ lý thông minh DH AI.'
                    : 'Configure authorization key, engine model, and company knowledge base for DH AI assistant.'}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  formData.ai.enabled
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-surface-sunken text-fg-subtle border border-border'
                }`}
              >
                {formData.ai.enabled
                  ? locale === 'vi'
                    ? 'Đang kích hoạt'
                    : 'Active'
                  : locale === 'vi'
                    ? 'Tạm tắt'
                    : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface-raised space-y-2">
            <Toggle
              label={
                locale === 'vi'
                  ? 'Kích hoạt trợ lý DH AI trên toàn website'
                  : 'Enable DH AI Assistant on Website'
              }
              hint={
                locale === 'vi'
                  ? 'Khi bật, khách hàng có thể mở khung tìm kiếm và chuyển sang chế độ DH AI để hỏi đáp thông minh.'
                  : 'When enabled, users can switch to DH AI mode in the header search modal for intelligent assistance.'
              }
              checked={formData.ai.enabled}
              onChange={val =>
                setFormData({
                  ...formData,
                  ai: { ...formData.ai, enabled: val },
                })
              }
            />
          </div>

          {/* Multi-API Key Pool Manager (Auto-Failover & Loop) */}
          <div className="p-4 sm:p-5 rounded-xl border border-border bg-surface-raised space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-fg">
                    {locale === 'vi'
                      ? 'Danh sách Khóa API Gemini (Tự động xoay vòng & Chuyển tiếp)'
                      : 'Gemini API Key Pool (Auto-Failover & Loop)'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                    {(formData.ai.apiKeys || []).filter(k => k.enabled !== false && (k.key || '').trim()).length}{' '}
                    {locale === 'vi' ? 'Key hoạt động' : 'Active'}
                  </span>
                </div>
                <p className="text-xs text-fg-subtle mt-1">
                  {locale === 'vi'
                    ? 'Thêm nhiều API Key để hệ thống tự động xoay vòng (Loop) và chuyển ngay sang Key kế tiếp khi có Key hết lượt request (Quota 429). Bạn có thể dán nhiều key cùng lúc (ngăn cách bởi dấu phẩy hoặc xuống dòng).'
                    : 'Add multiple Gemini API keys. The system automatically loops and fails over to the next key if a key hits rate limits (429) or quota exhaustion.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-fg text-xs font-medium transition-colors cursor-pointer"
                  title={showApiKey ? 'Ẩn tất cả khóa' : 'Hiện tất cả khóa'}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showApiKey ? (locale === 'vi' ? 'Ẩn key' : 'Hide') : (locale === 'vi' ? 'Hiện key' : 'Show')}</span>
                </button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addApiKey}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {locale === 'vi' ? 'Thêm API Key' : 'Add API Key'}
                </Button>
              </div>
            </div>

            <div className="space-y-2.5">
              {(formData.ai.apiKeys || []).map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2.5 p-2.5 rounded-lg border transition-colors ${
                    item.enabled !== false
                      ? 'border-border bg-surface'
                      : 'border-border-subtle bg-surface-sunken opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:w-48 shrink-0">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.label || ''}
                      onChange={e => updateApiKey(idx, 'label', e.target.value)}
                      placeholder={locale === 'vi' ? `Tên gợi nhớ #${idx + 1}` : `Key label #${idx + 1}`}
                      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-surface-raised text-fg text-xs font-medium focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={item.key || ''}
                      onChange={e => updateApiKey(idx, 'key', e.target.value)}
                      placeholder={
                        locale === 'vi'
                          ? 'Nhập hoặc dán khóa API Gemini (AIza... hoặc AQ....)...'
                          : 'Enter or paste Gemini API key...'
                      }
                      className="w-full px-3 py-1.5 rounded-md border border-border bg-surface text-fg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateApiKey(idx, 'enabled', item.enabled === false)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                        item.enabled !== false
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-surface-2 text-fg-subtle border-border'
                      }`}
                    >
                      {item.enabled !== false
                        ? locale === 'vi'
                          ? 'Đang bật'
                          : 'Enabled'
                        : locale === 'vi'
                          ? 'Tạm tắt'
                          : 'Paused'}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeApiKey(idx)}
                      className="p-1.5 rounded-md text-fg-subtle hover:text-danger hover:bg-danger-surface transition-colors cursor-pointer"
                      title={locale === 'vi' ? 'Xóa khóa này' : 'Remove key'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label={locale === 'vi' ? 'Mô hình AI xử lý ưu tiên (Model)' : 'Preferred AI Processing Model'}
              value={formData.ai.model}
              onChange={e =>
                setFormData({
                  ...formData,
                  ai: { ...formData.ai, model: e.target.value },
                })
              }
              helperText={
                locale === 'vi'
                  ? 'Hệ thống tự động ưu tiên mô hình này và dự phòng sang các mô hình Flash-Lite khác nếu quá tải.'
                  : 'The system prioritizes this model and automatically falls back to other Flash-Lite models if busy.'
              }
            >
              <option value="gemini-flash-lite-latest">
                {locale === 'vi'
                  ? 'gemini-flash-lite-latest (Khuyên dùng — Phản hồi siêu tốc & Ổn định cao nhất)'
                  : 'gemini-flash-lite-latest (Recommended — Ultra Fast & High Availability)'}
              </option>
              <option value="gemini-3.5-flash-lite">
                {locale === 'vi'
                  ? 'gemini-3.5-flash-lite (Flash-Lite thế hệ 3.5 — Tốc độ cao)'
                  : 'gemini-3.5-flash-lite (Flash-Lite 3.5 Generation — High Speed)'}
              </option>
              <option value="gemini-3.8-flash">
                {locale === 'vi'
                  ? 'gemini-3.8-flash (Gemini 3.8 Flash — Tiêu chuẩn mới)'
                  : 'gemini-3.8-flash (Gemini 3.8 Flash — New Standard)'}
              </option>
              <option value="gemini-flash-latest">
                {locale === 'vi'
                  ? 'gemini-flash-latest (Bản Flash tiêu chuẩn)'
                  : 'gemini-flash-latest (Standard Flash Edition)'}
              </option>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <label className="block text-xs font-semibold text-fg">
                  {locale === 'vi'
                    ? 'Dữ liệu tri thức nội bộ công ty (Company Knowledge Base)'
                    : 'Internal Company Knowledge Base'}
                </label>
                <p className="text-xs text-fg-subtle mt-0.5">
                  {locale === 'vi'
                    ? 'DH AI sẽ nạp và học toàn bộ dữ liệu này để trả lời khách hàng. Dữ liệu này KHÔNG hiển thị công khai trên web.'
                    : 'Ingested strictly by DH AI to understand your company nuances. Never exposed to the public UI.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-fg text-xs font-medium transition-colors">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>{locale === 'vi' ? 'Tải tệp (.txt, .md)' : 'Upload File'}</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    className="sr-only"
                    onChange={handleKnowledgeFileUpload}
                  />
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={handleFillTemplate}
                  className="text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  {locale === 'vi' ? 'Điền mẫu gợi ý' : 'Pre-fill Template'}
                </Button>
              </div>
            </div>

            <Textarea
              rows={12}
              placeholder={
                locale === 'vi'
                  ? 'Nhập các thông tin chuyên sâu về công ty, năng lực đội ngũ, quy trình bàn giao, chính sách chiết khấu, cam kết kỹ thuật...'
                  : 'Provide detailed internal knowledge about company policies, technical competencies, delivery workflows...'
              }
              value={formData.ai.companyKnowledge}
              onChange={e =>
                setFormData({
                  ...formData,
                  ai: { ...formData.ai, companyKnowledge: e.target.value },
                })
              }
              helperText={
                locale === 'vi'
                  ? `Độ dài hiện tại: ${formData.ai.companyKnowledge.length} ký tự. DH AI sẽ tự động phân tích và kết hợp dữ liệu này cùng dữ liệu trực tiếp từ website.`
                  : `Current length: ${formData.ai.companyKnowledge.length} characters. DH AI automatically merges this with live website data.`
              }
            />
          </div>
        </Card>
      )}
    </div>
  );
}
