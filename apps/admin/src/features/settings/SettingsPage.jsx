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
import { Sparkles, Eye, EyeOff, FileText, Upload } from 'lucide-react';

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
    socialLinks: [],
    seo: {
      title: { vi: '', en: '' },
      description: { vi: '', en: '' },
      keywords: { vi: '', en: '' },
    },
    ai: {
      enabled: true,
      apiKey: '',
      model: 'gemini-2.5-pro',
      companyKnowledge: '',
    },
  });

  useEffect(() => {
    if (settingsData) {
      const r = settingsData.resolved || settingsData;
      setFormData({
        companyName: r.companyName || { vi: '', en: '' },
        legalName: r.legalName || { vi: '', en: '' },
        tagline: r.tagline || { vi: '', en: '' },
        contactEmail: r.contactEmail || '',
        hotline: r.hotline || '',
        taxCode: r.taxCode || '',
        address: r.address || { vi: '', en: '' },
        workingHours: r.workingHours || { vi: '', en: '' },
        socialLinks: r.socialLinks || [],
        seo: {
          title: r.seo?.title || { vi: '', en: '' },
          description: r.seo?.description || { vi: '', en: '' },
          keywords: r.seo?.keywords || { vi: '', en: '' },
        },
        ai: {
          enabled: r.ai?.enabled !== false,
          apiKey: r.ai?.apiKey || '',
          model: r.ai?.model || 'gemini-2.5-pro',
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
    // Only what differs from the built-in defaults is stored.
    const defaults = settingsData?.defaults || {};
    saveMutation.mutate(diffAgainstDefaults(formData, defaults) || {});
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
    const template = `# TỔNG QUAN NĂNG LỰC & QUY TRÌNH DEV HOUSE SOFTWARE

## 1. Giới thiệu doanh nghiệp
Dev House Software là đơn vị công nghệ thành viên của Dev House Group, chuyên cung cấp giải pháp chuyển đổi số toàn diện, thiết kế website cao cấp chuẩn doanh nghiệp, hạ tầng máy chủ đám mây tốc độ cao và bảo mật dữ liệu an toàn.

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
    { key: 'social', label: locale === 'vi' ? 'Mạng xã hội' : 'Social Profiles' },
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-fg">
                {locale === 'vi' ? 'Khóa API bảo mật (Secret Key)' : 'Secret API Key'}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  placeholder={
                    locale === 'vi' ? 'Nhập khóa API bí mật...' : 'Enter secret API key...'
                  }
                  value={formData.ai.apiKey}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      ai: { ...formData.ai, apiKey: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-surface text-fg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg p-1 cursor-pointer transition-colors"
                  title={showApiKey ? 'Ẩn khóa' : 'Hiện khóa'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-fg-subtle">
                {locale === 'vi'
                  ? 'Khóa được mã hóa và lưu trữ an toàn trong cơ sở dữ liệu. Tuyệt đối không để lộ ra ngoài giao diện công khai.'
                  : 'Encrypted and stored securely in the database. Never exposed to public bundles or responses.'}
              </p>
            </div>

            <Select
              label={locale === 'vi' ? 'Mô hình AI xử lý (Model)' : 'AI Processing Model'}
              value={formData.ai.model}
              onChange={e =>
                setFormData({
                  ...formData,
                  ai: { ...formData.ai, model: e.target.value },
                })
              }
              helperText={
                locale === 'vi'
                  ? 'Mô hình mạnh nhất được khuyên dùng để DH AI xử lý tư vấn dịch vụ và báo giá chuẩn xác nhất.'
                  : 'The most capable model is recommended for comprehensive and accurate advisory.'
              }
            >
              <option value="gemini-2.5-pro">
                {locale === 'vi'
                  ? 'gemini-2.5-pro (Mạnh nhất & Khuyên dùng — Phân tích toàn diện)'
                  : 'gemini-2.5-pro (Most Capable & Recommended)'}
              </option>
              <option value="gemini-2.0-flash">
                {locale === 'vi'
                  ? 'gemini-2.0-flash (Tốc độ cao — Phản hồi tức thì)'
                  : 'gemini-2.0-flash (High Speed & Fast Response)'}
              </option>
              <option value="gemini-1.5-pro">
                {locale === 'vi'
                  ? 'gemini-1.5-pro (Bản Pro ổn định cao)'
                  : 'gemini-1.5-pro (Stable Pro Edition)'}
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
