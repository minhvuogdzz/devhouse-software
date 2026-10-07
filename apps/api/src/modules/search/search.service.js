import { ServiceModel } from '../services/service.model.js';
import { ProductModel } from '../products/product.model.js';
import { PackageModel } from '../packages/package.model.js';
import { ProjectModel } from '../projects/project.model.js';
import { SolutionModel } from '../solutions/solution.model.js';
import { TechnologyModel } from '../technologies/technology.model.js';
import { BlogPostModel } from '../blog/post.model.js';
import { SettingsModel } from '../settings/settings.model.js';
import { defaultSettings } from '@devhouse/content';

/**
 * Strips Vietnamese diacritics for flexible fuzzy matching.
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Escapes regex special characters.
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts plain text snippet around matched query.
 */
function createSnippet(text, query, maxLength = 160) {
  if (!text || typeof text !== 'string') return '';
  const clean = text
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  const lowerClean = clean.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const idx = lowerClean.indexOf(lowerQuery);

  if (idx === -1) {
    return clean.length > maxLength ? clean.slice(0, maxLength) + '...' : clean;
  }

  const start = Math.max(0, idx - 40);
  const end = Math.min(clean.length, idx + query.length + 100);
  let snippet = clean.slice(start, end);
  if (start > 0) snippet = '...' + snippet;
  if (end < clean.length) snippet = snippet + '...';
  return snippet;
}

export const searchService = {
  /**
   * Universal search across all database collections and static page contents.
   */
  async universalSearch({ q, locale = 'vi', limit = 25 }) {
    const rawQuery = (q || '').trim();
    if (!rawQuery) {
      return { query: '', total: 0, items: [] };
    }

    const regex = new RegExp(escapeRegex(rawQuery), 'i');
    const isEn = locale === 'en';
    const langPrefix = isEn ? '/en' : '';
    const localized = (obj, fallback = '') =>
      (isEn ? obj?.en || obj?.vi : obj?.vi || obj?.en) || fallback;

    // Search all collections concurrently with safety error catch
    const [services, products, packages, projects, solutions, technologies, posts] =
      await Promise.all([
        ServiceModel.find({
          status: 'published',
          isDeleted: false,
          $or: [
            { 'name.vi': regex },
            { 'name.en': regex },
            { 'shortDescription.vi': regex },
            { 'shortDescription.en': regex },
            { 'features.title.vi': regex },
            { 'features.title.en': regex },
          ],
        })
          .limit(10)
          .lean()
          .catch(() => []),

        ProductModel.find({
          status: 'published',
          isDeleted: false,
          $or: [
            { 'name.vi': regex },
            { 'name.en': regex },
            { 'shortDescription.vi': regex },
            { 'shortDescription.en': regex },
          ],
        })
          .limit(10)
          .lean()
          .catch(() => []),

        PackageModel.find({
          status: 'published',
          isDeleted: false,
          $or: [
            { 'name.vi': regex },
            { 'name.en': regex },
            { 'shortDescription.vi': regex },
            { 'shortDescription.en': regex },
            { 'audience.vi': regex },
            { 'audience.en': regex },
            { 'inclusions.text.vi': regex },
            { 'inclusions.text.en': regex },
          ],
        })
          .limit(10)
          .lean()
          .catch(() => []),

        ProjectModel.find({
          status: 'published',
          isDeleted: false,
          $or: [
            { 'title.vi': regex },
            { 'title.en': regex },
            { 'shortDescription.vi': regex },
            { 'shortDescription.en': regex },
            { 'client.name': regex },
          ],
        })
          .limit(10)
          .lean()
          .catch(() => []),

        SolutionModel.find({
          status: 'published',
          isDeleted: false,
          $or: [
            { 'name.vi': regex },
            { 'name.en': regex },
            { 'shortDescription.vi': regex },
            { 'shortDescription.en': regex },
            { 'targetAudience.vi': regex },
            { 'targetAudience.en': regex },
          ],
        })
          .limit(10)
          .lean()
          .catch(() => []),

        TechnologyModel.find({
          status: 'published',
          isDeleted: false,
          $or: [{ name: regex }, { 'description.vi': regex }, { 'description.en': regex }],
        })
          .limit(10)
          .lean()
          .catch(() => []),

        BlogPostModel.find({
          status: 'published',
          isDeleted: false,
          $or: [
            { 'title.vi': regex },
            { 'title.en': regex },
            { 'excerpt.vi': regex },
            { 'excerpt.en': regex },
            { 'contentText.vi': regex },
            { 'contentText.en': regex },
          ],
        })
          .limit(10)
          .lean()
          .catch(() => []),
      ]);

    const results = [];

    // 1. Services
    for (const item of services) {
      const title = localized(item.name);
      const desc = localized(item.shortDescription);
      const slug = isEn && item.slug?.en ? item.slug.en : item.slug?.vi || item._id;
      results.push({
        id: `service-${item._id}`,
        type: 'service',
        typeLabel: isEn ? 'Service' : 'Dịch vụ',
        title,
        description: createSnippet(desc, rawQuery),
        url: `${langPrefix}/services/${slug}`,
        badge: item.billing
          ? item.billing === 'recurring'
            ? isEn
              ? 'Recurring'
              : 'Định kỳ'
            : isEn
              ? 'One-time'
              : 'Trọn gói'
          : null,
      });
    }

    // 2. Products / Templates
    for (const item of products) {
      const title = localized(item.name);
      const desc = localized(item.shortDescription);
      results.push({
        id: `product-${item._id}`,
        type: 'product',
        typeLabel: isEn ? 'Website Template' : 'Mẫu website',
        title,
        description: createSnippet(desc, rawQuery),
        url: `${langPrefix}/products`,
        badge: isEn ? 'Template' : 'Mẫu chuẩn',
      });
    }

    // 3. Packages
    for (const item of packages) {
      const title = localized(item.name);
      const desc = localized(item.shortDescription) || localized(item.audience);
      results.push({
        id: `package-${item._id}`,
        type: 'package',
        typeLabel: isEn ? 'Pricing Package' : 'Gói dịch vụ',
        title,
        description: createSnippet(desc, rawQuery),
        url: `${langPrefix}/packages`,
        badge: item.setupFee || item.recurringFee ? (isEn ? 'Official Pricing' : 'Bảng giá') : null,
      });
    }

    // 4. Projects
    for (const item of projects) {
      const title = localized(item.title);
      const desc = localized(item.shortDescription);
      const slug = isEn && item.slug?.en ? item.slug.en : item.slug?.vi || item._id;
      results.push({
        id: `project-${item._id}`,
        type: 'project',
        typeLabel: isEn ? 'Project' : 'Dự án',
        title,
        description: createSnippet(desc, rawQuery),
        url: `${langPrefix}/projects/${slug}`,
        badge: item.client?.name || (isEn ? 'Case Study' : 'Thực tế'),
      });
    }

    // 5. Solutions
    for (const item of solutions) {
      const title = localized(item.name);
      const desc = localized(item.shortDescription);
      results.push({
        id: `solution-${item._id}`,
        type: 'solution',
        typeLabel: isEn ? 'Solution' : 'Giải pháp',
        title,
        description: createSnippet(desc, rawQuery),
        url: `${langPrefix}/solutions`,
        badge: isEn ? 'Solution' : 'Giải pháp',
      });
    }

    // 6. Technologies
    for (const item of technologies) {
      const title = item.name;
      const desc = localized(item.description);
      results.push({
        id: `tech-${item._id}`,
        type: 'technology',
        typeLabel: isEn ? 'Technology' : 'Công nghệ',
        title,
        description: createSnippet(desc, rawQuery),
        url: `${langPrefix}/technologies`,
        badge: isEn ? 'Stack' : 'Nền tảng',
      });
    }

    // 7. Blog Posts
    for (const item of posts) {
      const title = localized(item.title);
      const desc = localized(item.excerpt) || localized(item.contentText);
      const slug = isEn && item.slug?.en ? item.slug.en : item.slug?.vi || item._id;
      results.push({
        id: `post-${item._id}`,
        type: 'blog',
        typeLabel: isEn ? 'Article' : 'Bài viết',
        title,
        description: createSnippet(desc, rawQuery),
        url: `${langPrefix}/blog/${slug}`,
        badge: isEn ? 'Blog' : 'Tin tức',
      });
    }

    // 8. Static Content Pages from PAGE_REGISTRY
    const staticPages = [
      { key: 'home', vi: 'Trang chủ', en: 'Home', path: '/' },
      { key: 'about', vi: 'Về chúng tôi', en: 'About Dev House', path: '/about' },
      { key: 'services-index', vi: 'Dịch vụ trọn gói', en: 'Services', path: '/services' },
      { key: 'packages-index', vi: 'Bảng giá dịch vụ', en: 'Pricing Packages', path: '/packages' },
      { key: 'products-index', vi: 'Kho mẫu website', en: 'Website Templates', path: '/products' },
      { key: 'solutions-index', vi: 'Giải pháp doanh nghiệp', en: 'Solutions', path: '/solutions' },
      { key: 'projects-index', vi: 'Dự án thực tế', en: 'Portfolio & Projects', path: '/projects' },
      {
        key: 'technologies-index',
        vi: 'Công nghệ & Nền tảng',
        en: 'Technologies',
        path: '/technologies',
      },
      { key: 'blog-index', vi: 'Bài viết & Kiến thức', en: 'Articles & Insights', path: '/blog' },
      { key: 'careers', vi: 'Cơ hội nghề nghiệp', en: 'Careers', path: '/careers' },
      { key: 'contact', vi: 'Liên hệ tư vấn', en: 'Contact Us', path: '/contact' },
      { key: 'privacy', vi: 'Chính sách bảo mật', en: 'Privacy Policy', path: '/privacy' },
      { key: 'terms', vi: 'Điều khoản dịch vụ', en: 'Terms of Service', path: '/terms' },
    ];

    const qNormalized = normalizeText(rawQuery);
    for (const page of staticPages) {
      const title = isEn ? page.en : page.vi;
      const titleNorm = normalizeText(title);
      if (titleNorm.includes(qNormalized)) {
        results.push({
          id: `page-${page.key}`,
          type: 'page',
          typeLabel: isEn ? 'Page' : 'Trang',
          title,
          description: isEn
            ? `Official ${page.en} page on Dev House Software.`
            : `Trang thông tin chính thức: ${page.vi} của Dev House Software.`,
          url: page.path === '/' ? (isEn ? '/en' : '/') : `${langPrefix}${page.path}`,
          badge: isEn ? 'Navigation' : 'Chuyên mục',
        });
      }
    }

    // Prioritize exact or title matches, then description matches
    results.sort((a, b) => {
      const aTitleMatch = normalizeText(a.title).includes(qNormalized);
      const bTitleMatch = normalizeText(b.title).includes(qNormalized);
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return 0;
    });

    const paginated = results.slice(0, limit);

    return {
      query: rawQuery,
      total: results.length,
      items: paginated,
    };
  },

  /**
   * AI Search powered by DH AI assistant.
   * Leverages Gemini model under the hood using admin-configured key.
   */
  async aiSearch({ q, locale = 'vi' }) {
    const rawQuery = (q || '').trim();
    const isEn = locale === 'en';

    if (!rawQuery) {
      return {
        query: '',
        answer: isEn
          ? 'Please enter your question. DH AI is ready to assist you with services, pricing, solutions, and technology consultancy.'
          : 'Vui lòng nhập câu hỏi của bạn. DH AI luôn sẵn sàng hỗ trợ tư vấn dịch vụ, báo giá, giải pháp công nghệ và quy trình triển khai.',
        relatedResults: [],
        mode: 'ai',
      };
    }

    // Retrieve settings
    const settingsDoc = await SettingsModel.findOne({ key: 'global' })
      .lean()
      .catch(() => null);
    const overrides = settingsDoc?.data || {};
    const aiConfig = {
      enabled: overrides.ai?.enabled ?? defaultSettings.ai?.enabled ?? true,
      apiKey: overrides.ai?.apiKey || process.env.GEMINI_API_KEY || '',
      model: overrides.ai?.model || 'gemini-2.5-pro',
      companyKnowledge: overrides.ai?.companyKnowledge || '',
    };

    // Parallel fetch related search results to enrich response
    const searchPromise = this.universalSearch({ q: rawQuery, locale, limit: 6 });

    // If AI is disabled or API key not yet set in Admin:
    if (!aiConfig.enabled || !aiConfig.apiKey) {
      const searchRes = await searchPromise;
      const noKeyMessage = isEn
        ? `### Welcome to **DH AI**\n\nThe intelligent assistant is currently being configured with authorization credentials by the system administrator.\n\nHere are the most relevant resources found across **Dev House Software** for your query:\n\n* **Official Contact**: Hotline **0869 528 304** | Email **devhousesoftware.inc@gmail.com**\n* You can explore the direct links below to find what you need immediately.`
        : `### Trợ lý thông minh **DH AI**\n\nHệ thống trợ lý DH AI đang được quản trị viên hoàn tất kết nối khóa xác thực.\n\nDưới đây là các thông tin và dịch vụ liên quan trực tiếp đến yêu cầu của bạn trên website **Dev House Software**:\n\n* **Đầu mối hỗ trợ 24/7**: Hotline **0869 528 304** | Email **devhousesoftware.inc@gmail.com**\n* Bạn có thể bấm vào các liên kết gợi ý bên dưới để xem chi tiết ngay lập tức.`;

      return {
        query: rawQuery,
        answer: noKeyMessage,
        relatedResults: searchRes.items,
        mode: 'ai',
      };
    }

    // Retrieve brief catalog summary for deep AI understanding
    const [allServices, allPackages, allSolutions, allProjects] = await Promise.all([
      ServiceModel.find({ status: 'published', isDeleted: false })
        .select('name shortDescription billing')
        .limit(20)
        .lean()
        .catch(() => []),
      PackageModel.find({ status: 'published', isDeleted: false })
        .select('name setupFee recurringFee recurringPeriod currency shortDescription')
        .limit(10)
        .lean()
        .catch(() => []),
      SolutionModel.find({ status: 'published', isDeleted: false })
        .select('name shortDescription')
        .limit(10)
        .lean()
        .catch(() => []),
      ProjectModel.find({ status: 'published', isDeleted: false })
        .select('title shortDescription client')
        .limit(10)
        .lean()
        .catch(() => []),
    ]);

    // Build Catalog Context
    const servicesSummary = allServices
      .map(
        s =>
          `- ${s.name?.vi || s.name?.en}: ${s.shortDescription?.vi || s.shortDescription?.en || ''}`,
      )
      .join('\n');
    const packagesSummary = allPackages
      .map(
        p =>
          `- Gói ${p.name?.vi || p.name?.en}: Phí cài đặt ${p.setupFee ? p.setupFee.toLocaleString('vi-VN') + ' ' + (p.currency || 'VND') : 'Liên hệ'}, phí duy trì ${p.recurringFee ? p.recurringFee.toLocaleString('vi-VN') + ' ' + (p.currency || 'VND') + '/' + (p.recurringPeriod === 'year' ? 'năm' : 'kỳ') : 'Liên hệ'}. ${p.shortDescription?.vi || ''}`,
      )
      .join('\n');
    const solutionsSummary = allSolutions
      .map(sol => `- ${sol.name?.vi || sol.name?.en}: ${sol.shortDescription?.vi || ''}`)
      .join('\n');
    const projectsSummary = allProjects
      .map(
        prj =>
          `- ${prj.title?.vi || prj.title?.en} (${prj.client?.name || 'Khách hàng'}): ${prj.shortDescription?.vi || ''}`,
      )
      .join('\n');

    // Build Comprehensive System Prompt
    const systemPrompt = `
Bạn là **DH AI** — Trợ lý Trí tuệ Nhân tạo thông minh, chuẩn xác và tận tâm của **Dev House Software** (thuộc Dev House Group, website chính thức: devhouse.vn).

THÔNG TIN DOANH NGHIỆP:
- Tên thương hiệu: Dev House Software
- Lĩnh vực: Thiết kế website trọn gói, giải pháp phần mềm, hạ tầng máy chủ đám mây, tên miền và bảo mật an toàn thông tin.
- Triết lý & Định hướng: Cung cấp giải pháp trọn gói, ổn định, an toàn để khách hàng chỉ cần tập trung kinh doanh.
- Hotline tư vấn: 0869 528 304
- Email liên hệ: devhousesoftware.inc@gmail.com
- Địa chỉ: Phường Tây Hồ, Thành phố Hà Nội
- Giờ làm việc: Thứ Hai - Thứ Sáu: 08:30 - 18:00

DANH MỤC DỊCH VỤ TRÊN WEBSITE:
${servicesSummary || '- Dịch vụ thiết kế website doanh nghiệp, cổng thông tin, landing page, giải pháp phần mềm quản lý, máy chủ và bảo mật.'}

BẢNG GIÁ & GÓI CƯỚC:
${packagesSummary || '- Các gói dịch vụ linh hoạt, thanh toán trọn gói hoặc định kỳ theo nhu cầu khách hàng.'}

GIẢI PHÁP ĐÃ TRIỂN KHAI:
${solutionsSummary || '- Giải pháp chuyển đổi số cho doanh nghiệp bán lẻ, giáo dục, bất động sản, logistics...'}

DỰ ÁN TIÊU BIỂU:
${projectsSummary || '- Nhiều dự án thực tế cho doanh nghiệp vừa và nhỏ.'}

${aiConfig.companyKnowledge ? `DỮ LIỆU TRI THỨC NỘI BỘ DO DOANH NGHIỆP CUNG CẤP:\n${aiConfig.companyKnowledge}\n` : ''}

NGUYÊN TẮC HOẠT ĐỘNG VÀ PHONG CÁCH TRẢ LỜI CỦA DH AI:
1. Danh xưng và nhận diện: Luôn xưng là "DH AI" hoặc "em/tôi" đại diện cho Dev House Software. TUYỆT ĐỐI KHÔNG BAO GIỜ nhắc đến Google, Gemini, OpenAI hay bất kỳ nhà cung cấp AI nào khác. Bạn là DH AI của Dev House Software.
2. Ngôn ngữ kinh doanh thực tế: Sử dụng từ ngữ rõ ràng, lịch sự, tập trung vào lợi ích kinh doanh, kết quả đạt được, sự an tâm và hiệu quả cho khách hàng (không lạm dụng biệt ngữ kỹ thuật khó hiểu).
3. Đầy đủ & chính xác: Trả lời đúng trọng tâm câu hỏi của khách hàng dựa trên dữ liệu trên. Nếu khách hàng hỏi giá, nêu rõ các gói cước và đề xuất liên hệ để có báo giá tối ưu nhất.
4. Trình bày đẹp mắt: Sử dụng định dạng Markdown khoa học:
   - Các đề mục ngắn gọn
   - Gạch đầu dòng rõ ràng
   - Chữ in đậm cho các điểm mấu chốt quan trọng
5. Ngôn ngữ phản hồi: ${isEn ? 'Trả lời bằng tiếng Anh (English).' : 'Trả lời bằng tiếng Việt chuyên nghiệp, tự nhiên.'}
6. Lời kêu gọi hành động (CTA): Luôn gợi ý khách hàng liên hệ Hotline 0869 528 304 hoặc gửi yêu cầu tư vấn trên website để được đội ngũ kỹ sư Dev House phục vụ chu đáo nhất.
`;

    try {
      const model = aiConfig.model || 'gemini-2.5-pro';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${aiConfig.apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n---\n\nCâu hỏi của khách hàng: "${rawQuery}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If the strongest model gemini-2.5-pro returns 404 or model not found, try fallback to gemini-2.0-flash
        if (response.status === 404 && model !== 'gemini-2.0-flash') {
          const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiConfig.apiKey}`;
          const fallbackRes = await fetch(fallbackEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `${systemPrompt}\n\n---\n\nCâu hỏi của khách hàng: "${rawQuery}"` },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 2048,
              },
            }),
          });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            const text = fbData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const searchRes = await searchPromise;
              return {
                query: rawQuery,
                answer: text,
                relatedResults: searchRes.items,
                mode: 'ai',
              };
            }
          }
        }

        throw new Error(errorData?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const answerText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      const searchRes = await searchPromise;

      return {
        query: rawQuery,
        answer:
          answerText || (isEn ? 'No response generated.' : 'Không nhận được phản hồi từ hệ thống.'),
        relatedResults: searchRes.items,
        mode: 'ai',
      };
    } catch (err) {
      const searchRes = await searchPromise;
      const fallbackMsg = isEn
        ? `### DH AI Response\n\nDH AI encountered an issue processing your query at this moment. You can browse the relevant sections on our website below or directly reach out to our team at **0869 528 304** (Hotline) or **devhousesoftware.inc@gmail.com**.`
        : `### Trợ lý DH AI\n\nHệ thống DH AI đang trong quá trình đồng bộ dữ liệu. Dưới đây là các nội dung tìm kiếm trực tiếp trên website phù hợp với yêu cầu của bạn, hoặc bạn có thể liên hệ ngay hotline **0869 528 304** để được đội ngũ Dev House tư vấn trực tiếp.`;

      return {
        query: rawQuery,
        answer: fallbackMsg,
        relatedResults: searchRes.items,
        mode: 'ai',
        error: err.message,
      };
    }
  },
};
