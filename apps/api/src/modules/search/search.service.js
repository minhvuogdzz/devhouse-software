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
      { key: 'about', vi: 'Về chúng tôi', en: 'About Devhouse', path: '/about' },
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
            ? `Official ${page.en} page on Devhouse Software.`
            : `Trang thông tin chính thức: ${page.vi} của Devhouse Software.`,
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
   * Leverages Gemini model under the hood using admin-configured key pool with automatic failover & loop.
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
    const keyPool = resolveApiKeyPool(overrides.ai);
    const aiConfig = {
      enabled: overrides.ai?.enabled ?? defaultSettings.ai?.enabled ?? true,
      keys: keyPool,
      model: overrides.ai?.model || 'gemini-flash-lite-latest',
      companyKnowledge: overrides.ai?.companyKnowledge || '',
    };

    // Parallel fetch related search results to enrich response
    const searchPromise = this.universalSearch({ q: rawQuery, locale, limit: 6 });

    // If AI is disabled or no API key in pool:
    if (!aiConfig.enabled || aiConfig.keys.length === 0) {
      const searchRes = await searchPromise;
      const noKeyMessage = isEn
        ? `### Welcome to **DH AI**\n\nThe intelligent assistant is currently being configured with authorization credentials by the system administrator.\n\nHere are the most relevant resources found across **Devhouse Software** for your query:\n\n* **Official Contact**: Hotline **0869 528 304** | Email **devhousesoftware.inc@gmail.com**\n* You can explore the direct links below to find what you need immediately.`
        : `### Trợ lý thông minh **DH AI**\n\nHệ thống trợ lý DH AI đang được quản trị viên hoàn tất kết nối khóa xác thực.\n\nDưới đây là các thông tin và dịch vụ liên quan trực tiếp đến yêu cầu của bạn trên website **Devhouse Software**:\n\n* **Đầu mối hỗ trợ 24/7**: Hotline **0869 528 304** | Email **devhousesoftware.inc@gmail.com**\n* Bạn có thể bấm vào các liên kết gợi ý bên dưới để xem chi tiết ngay lập tức.`;

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
Bạn là **DH AI** — Trợ lý Trí tuệ Nhân tạo thông minh, chuẩn xác và tận tâm của **Devhouse Software** (thuộc Devhouse Group, website chính thức: devhouse.vn).

THÔNG TIN DOANH NGHIỆP:
- Tên thương hiệu: Devhouse Software
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

DỰ ÁN TIỂU BIỂU:
${projectsSummary || '- Nhiều dự án thực tế cho doanh nghiệp vừa và nhỏ.'}

${aiConfig.companyKnowledge ? `DỮ LIỆU TRI THỨC NỘI BỘ DO DOANH NGHIỆP CUNG CẤP:\n${aiConfig.companyKnowledge}\n` : ''}

QUY TẮC BẮT BUỘC VỀ ĐỊNH DẠNG VÀ PHONG CÁCH TRẢ LỜI CỦA DH AI:
1. Danh xưng: Luôn xưng là "DH AI" hoặc "em/chúng em" đại diện cho Devhouse Software. TUYỆT ĐỐI KHÔNG BAO GIỜ nhắc đến Google, Gemini, OpenAI hay bất kỳ bên thứ ba nào.
2. NGUYÊN TẮC TRÌNH BÀY ĐẸP MẮT, KHOA HỌC, ĐẲNG CẤP DOANH NGHIỆP (CỰC KỲ QUAN TRỌNG):
   - BẮT BUỘC XUỐNG DÒNG RÕ RÀNG giữa các phần, các câu và các ý.
   - TUYỆT ĐỐI KHÔNG VIẾT DÍNH NHIỀU Ý HOẶC DÙNG DẤU HOA THỊ TRÊN CÙNG MỘT DÒNG (cấm viết kiểu: "...đoạn văn... * **Ý 1** * **Ý 2**").
   - CÁC ĐỀ MỤC LỚN: Bắt buộc dùng cú pháp tiêu đề Markdown trên một dòng riêng biệt, ví dụ:
     ### 1. Tổng quan giải pháp
     ### 2. Quy trình làm việc 6 bước
     ### 3. Cam kết chất lượng
     ### 4. Thông tin liên hệ chính thức
   - CÁC Ý LIỆT KÊ: Mỗi ý phải nằm trên một dòng riêng biệt bắt đầu bằng dấu gạch ngang:
     - **Tên ý chính:** Diễn giải chi tiết...
     - **Tên ý tiếp theo:** Diễn giải chi tiết...
   - CÁC BƯỚC QUY TRÌNH: Mỗi bước phải nằm trên một dòng riêng biệt có đánh số thứ tự:
     1. **Bước 1 (Tiếp nhận & Tư vấn):** Lắng nghe nhu cầu...
     2. **Bước 2 (Lập phương án):** Xây dựng giải pháp...
   - THÔNG TIN LIÊN HỆ: Cuối câu trả lời, trình bày từng dòng rõ ràng:
     - **Hotline tư vấn:** 0869 528 304
     - **Email:** devhousesoftware.inc@gmail.com
     - **Địa chỉ:** Phường Tây Hồ, Thành phố Hà Nội
   - TUYỆT ĐỐI KHÔNG dùng dấu hoa thị rác như '***', '* *'. Luôn để một dòng trống giữa các đoạn văn để giao diện thoáng đãng, dễ đọc.
3. Ngôn ngữ phản hồi: ${isEn ? 'Trả lời bằng tiếng Anh (English).' : 'Trả lời bằng tiếng Việt chuyên nghiệp, tự nhiên, lịch sự, đúng trọng tâm.'}
`;

    try {
      const candidateModels = Array.from(
        new Set(
          [
            'gemini-flash-lite-latest',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            aiConfig.model,
            'gemini-3.8-flash',
            'gemini-flash-latest',
          ].filter(Boolean),
        ),
      );

      const answerText = await callGeminiWithKeyRotation({
        keys: aiConfig.keys,
        candidateModels,
        buildPrimaryBody: () => ({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: `Câu hỏi tìm kiếm của khách hàng: "${rawQuery}"` }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
        buildFallbackBody: () => ({
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

      const searchRes = await searchPromise;

      return {
        query: rawQuery,
        answer: cleanAndFormatAiMarkdown(answerText),
        relatedResults: searchRes.items,
        mode: 'ai',
      };
    } catch (err) {
      const searchRes = await searchPromise;
      const fallbackMsg = isEn
        ? `### DH AI Response\n\nDH AI encountered an issue processing your query at this moment. You can browse the relevant sections on our website below or directly reach out to our team at **0869 528 304** (Hotline) or **devhousesoftware.inc@gmail.com**.`
        : `### Trợ lý DH AI\n\nHệ thống DH AI đang trong quá trình đồng bộ dữ liệu. Dưới đây là các nội dung tìm kiếm trực tiếp trên website phù hợp với yêu cầu của bạn, hoặc bạn có thể liên hệ ngay hotline **0869 528 304** để được đội ngũ Devhouse tư vấn trực tiếp.`;

      return {
        query: rawQuery,
        answer: fallbackMsg,
        relatedResults: searchRes.items,
        mode: 'ai',
        error: err.message,
      };
    }
  },

  /**
   * Conversational AI Assistant (DH AI Chatbot)
   * Persona: "xưng em, gọi anh chị/quý đối tác", warm, respectful, natural conversation flow.
   */
  async aiChat({ message, history = [], locale = 'vi' }) {
    const rawMessage = (message || '').trim();
    if (!rawMessage) {
      return {
        answer:
          locale === 'en'
            ? 'Hello! How may I assist you with Devhouse Software today?'
            : 'Dạ em chào anh/chị ạ! Em có thể hỗ trợ thông tin gì cho anh/chị về dịch vụ của Devhouse Software hôm nay ạ?',
      };
    }

    const isEn = locale === 'en';

    // Retrieve settings (uses the same Gemini key pool configured in Admin)
    const settingsDoc = await SettingsModel.findOne({ key: 'global' }).lean();
    const overrides = settingsDoc?.data || {};
    const keyPool = resolveApiKeyPool(overrides.ai);
    const aiConfig = {
      enabled: overrides.ai?.enabled ?? defaultSettings.ai?.enabled ?? true,
      keys: keyPool,
      model: overrides.ai?.model || 'gemini-flash-lite-latest',
      companyKnowledge: overrides.ai?.companyKnowledge || '',
    };

    if (!aiConfig.enabled || aiConfig.keys.length === 0) {
      const fallbackMsg = isEn
        ? `Hello! I am **DH AI**, the virtual consultant at Devhouse Software. The administrator is currently finalizing my connection credentials. If you need any immediate assistance regarding our web design, hosting, or software services, please feel free to reach our team at **0869 528 304** (Hotline) or email **devhousesoftware.inc@gmail.com**. We are always delighted to assist you!`
        : `Dạ em chào anh/chị ạ! Em là **DH AI** — Chuyên viên tư vấn ảo của Devhouse Software. Hiện tại hệ thống trợ lý trực tuyến đang được quản trị viên hoàn tất kết nối. Anh/chị cần tư vấn nhanh về bảng giá thiết kế website, máy chủ đám mây hay quy trình chuyển đổi số, anh/chị có thể liên hệ trực tiếp hotline **0869 528 304** hoặc email **devhousesoftware.inc@gmail.com** để các chuyên viên kỹ thuật của Devhouse hỗ trợ anh/chị ngay nhé ạ!`;

      return {
        answer: fallbackMsg,
        success: false,
      };
    }

    // Retrieve catalog summary
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

    const systemPrompt = `
Bạn là **DH AI** — Chuyên viên tư vấn ảo thông minh, chu đáo và tận tâm của **Devhouse Software** (thuộc Devhouse Group, website chính thức: devhouse.vn).

NGUYÊN TẮC XƯNG HÔ VÀ PHONG THÁI TƯ VẤN (BẮT BUỘC):
1. Xưng hô:
   - Luôn xưng là "em" (hoặc "chúng em" khi đại diện cho tập thể Devhouse Software).
   - Luôn gọi người dùng là "anh/chị" hoặc "quý đối tác".
   - Bắt đầu câu trả lời bằng lời chào hỏi ấm áp, tôn trọng (Ví dụ: "Dạ em chào anh/chị ạ!", "Dạ thưa anh/chị,...").
2. Ngữ điệu & Khung cảnh câu chuyện:
   - Trả lời tự nhiên, có ngữ điệu trò chuyện đàm thoại chân thành, chu đáo, hiểu chuyện và khéo léo như một chuyên viên tư vấn khách hàng thực thụ.
   - Nhớ ngữ cảnh hội thoại của các tin nhắn trước để phản hồi liền mạch, không lặp lại rập khuôn máy móc.
   - Trả lời đúng trọng tâm câu hỏi của khách hàng, giải thích rõ ràng, súc tích và mạch lạc.
   - Khi tư vấn xong, khéo léo gợi mở hoặc mời anh/chị liên hệ hotline 0869 528 304 hoặc gửi yêu cầu để được hỗ trợ chuyên sâu hơn.
3. Nguyên tắc cấm kỵ:
   - Tuyệt đối KHÔNG BAO GIỜ nhắc đến Google, Gemini, OpenAI hay bất kỳ bên thứ ba nào.
   - Tuyệt đối KHÔNG viết hoa thị lộn xộn hay dính chùm '***', '* *'.
   - Trình bày ngắt đoạn rõ ràng, thoáng mắt để khách hàng đọc trên ô chat nhỏ thuận tiện nhất.
4. Thông tin doanh nghiệp Devhouse Software:
   - Hotline tư vấn: 0869 528 304 (hỗ trợ 24/7)
   - Email: devhousesoftware.inc@gmail.com
   - Địa chỉ: Phường Tây Hồ, Thành phố Hà Nội
   - Dịch vụ chính: Thiết kế website trọn gói chuẩn SEO, phát triển phần mềm theo yêu cầu, hạ tầng máy chủ đám mây, tường lửa bảo mật WAF, tên miền & SSL.
   - Quy trình 6 bước: 1. Tiếp nhận & tư vấn -> 2. Khảo sát & hợp đồng -> 3. Thiết kế UI/UX độc quyền -> 4. Lập trình tính năng -> 5. Kiểm thử UAT & bảo mật -> 6. Bàn giao & bảo hành trọn đời.

DỊCH VỤ WEBSITE:
${servicesSummary || '- Dịch vụ thiết kế website doanh nghiệp, cổng thông tin, landing page, giải pháp phần mềm quản lý, máy chủ và bảo mật.'}

BẢNG GIÁ & GÓI CƯỚC:
${packagesSummary || '- Các gói dịch vụ linh hoạt theo nhu cầu khách hàng.'}

GIẢI PHÁP ĐÃ TRIỂN KHAI:
${solutionsSummary || '- Giải pháp chuyển đổi số cho doanh nghiệp bán lẻ, giáo dục, bất động sản, logistics...'}

DỰ ÁN TIÊU BIỂU:
${projectsSummary || '- Nhiều dự án thực tế cho doanh nghiệp vừa và nhỏ.'}

${aiConfig.companyKnowledge ? `DỮ LIỆU TRI THỨC DOANH NGHIỆP CUNG CẤP:\n${aiConfig.companyKnowledge}\n` : ''}

Ngôn ngữ: ${isEn ? 'Trả lời bằng tiếng Anh, xưng I/we và gọi you, thân thiện và chuyên nghiệp.' : 'Trả lời bằng tiếng Việt tự nhiên, ấm áp, xưng em, gọi anh/chị.'}
`;

    try {
      const candidateModels = Array.from(
        new Set(
          [
            'gemini-flash-lite-latest',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            aiConfig.model,
            'gemini-3.8-flash',
            'gemini-flash-latest',
          ].filter(Boolean),
        ),
      );

      // Clean history and build strictly alternating turns starting with user
      const validHistory = (Array.isArray(history) ? history : [])
        .map(h => ({
          role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
          text: String(h.text || h.content || '').trim(),
        }))
        .filter(h => h.text);

      // If last item in history is identical to current user message, pop it to prevent duplication
      if (
        validHistory.length > 0 &&
        validHistory[validHistory.length - 1].role === 'user' &&
        validHistory[validHistory.length - 1].text === rawMessage
      ) {
        validHistory.pop();
      }

      const contents = [];
      for (const item of validHistory) {
        // Conversation in Gemini contents must start with 'user'. Skip initial greeting if it is model.
        if (contents.length === 0 && item.role === 'model') {
          continue;
        }
        const prev = contents[contents.length - 1];
        if (prev && prev.role === item.role) {
          prev.parts[0].text += '\n' + item.text;
        } else {
          contents.push({ role: item.role, parts: [{ text: item.text }] });
        }
      }

      // Append current user message
      const lastTurn = contents[contents.length - 1];
      if (lastTurn && lastTurn.role === 'user') {
        lastTurn.parts[0].text += '\n' + rawMessage;
      } else {
        contents.push({ role: 'user', parts: [{ text: rawMessage }] });
      }

      const answerText = await callGeminiWithKeyRotation({
        keys: aiConfig.keys,
        candidateModels,
        buildPrimaryBody: () => ({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1500,
          },
        }),
        buildFallbackBody: () => ({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\n[Bắt đầu cuộc trò chuyện tư vấn]\n\n${contents[0]?.parts?.[0]?.text || ''}`,
                },
              ],
            },
            ...contents.slice(1),
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1500,
          },
        }),
      });

      return {
        answer: cleanAndFormatAiMarkdown(answerText),
        success: true,
      };
    } catch (err) {
      const fallbackMsg = isEn
        ? `I am sorry, I am currently synchronizing the latest database. Please feel free to reach out directly to our hotline at **0869 528 304** or email **devhousesoftware.inc@gmail.com** for immediate support!`
        : `Dạ em xin lỗi anh/chị, hệ thống tư vấn của em đang trong giây lát đồng bộ lại dữ liệu. Anh/chị có thể để lại tin nhắn hoặc gọi trực tiếp hotline **0869 528 304** để các bạn chuyên viên kỹ thuật của Devhouse hỗ trợ anh/chị ngay lập tức nhé ạ!`;

      return {
        answer: fallbackMsg,
        success: false,
        error: err.message,
      };
    }
  },
};

/**
 * Module-level state for Gemini API Key Pool Rotation & Cooldown Tracking
 */
let keyLoopPointer = 0;
const keyCooldownUntil = new Map();

/**
 * Extracts and deduplicates all enabled Gemini API keys from settings overrides and environment.
 * Supports:
 * - ai.apiKeys: Array<{ key: string, label?: string, enabled?: boolean } | string>
 * - ai.apiKey: string (single key or comma/newline-separated keys)
 * - process.env.GEMINI_API_KEY: string (single key or comma/newline-separated keys)
 */
export function resolveApiKeyPool(aiOverrides = {}) {
  const pool = [];
  const seen = new Set();

  const pushRawString = raw => {
    if (!raw || typeof raw !== 'string') return;
    const parts = raw
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(Boolean);
    for (const k of parts) {
      if (!seen.has(k)) {
        seen.add(k);
        pool.push(k);
      }
    }
  };

  if (Array.isArray(aiOverrides?.apiKeys)) {
    for (const item of aiOverrides.apiKeys) {
      if (typeof item === 'string') {
        pushRawString(item);
      } else if (item && typeof item === 'object' && item.enabled !== false) {
        pushRawString(item.key);
      }
    }
  }

  if (aiOverrides?.apiKey) {
    pushRawString(aiOverrides.apiKey);
  }

  if (process.env.GEMINI_API_KEYS) {
    pushRawString(process.env.GEMINI_API_KEYS);
  }

  if (process.env.GEMINI_API_KEY) {
    pushRawString(process.env.GEMINI_API_KEY);
  }

  return pool;
}

/**
 * Executes a Gemini generation request across a pool of API keys and candidate models.
 * - Loops circularly through the key pool starting from `keyLoopPointer`.
 * - Automatically detects quota exhaustion (HTTP 429 / RESOURCE_EXHAUSTED) or invalid/blocked keys (401/403),
 *   places the exhausted key in temporary cooldown, and immediately fails over to the next key in the pool.
 */
async function callGeminiWithKeyRotation({
  keys,
  candidateModels,
  buildPrimaryBody,
  buildFallbackBody,
}) {
  const totalKeys = keys.length;
  if (totalKeys === 0) {
    throw new Error('No Gemini API keys available in pool.');
  }

  const now = Date.now();
  const startIdx = keyLoopPointer % totalKeys;

  // Build circular order starting at startIdx: healthy keys first, cooled-down keys as fallback
  const healthyIndices = [];
  const cooldownIndices = [];
  for (let offset = 0; offset < totalKeys; offset++) {
    const idx = (startIdx + offset) % totalKeys;
    const k = keys[idx];
    const until = keyCooldownUntil.get(k) || 0;
    if (until > now) {
      cooldownIndices.push(idx);
    } else {
      healthyIndices.push(idx);
    }
  }

  const orderedIndices = [...healthyIndices, ...cooldownIndices];
  let lastError = null;

  for (const keyIdx of orderedIndices) {
    const apiKey = keys[keyIdx];

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        let response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPrimaryBody()),
        });

        // Fallback if model endpoint does not support system_instruction (400 Bad Request, not key invalid)
        if (!response.ok && response.status === 400 && buildFallbackBody) {
          const errProbe = await response
            .clone()
            .json()
            .catch(() => ({}));
          const errMsg = String(errProbe?.error?.message || '');
          const isInvalidKey =
            errMsg.toLowerCase().includes('api key') ||
            errProbe?.error?.status === 'INVALID_ARGUMENT';
          if (isInvalidKey && errMsg.toLowerCase().includes('key')) {
            // Key itself is invalid -> mark cooldown and jump to next key immediately
            keyCooldownUntil.set(apiKey, Date.now() + 10 * 60 * 1000);
            lastError = errMsg || 'Invalid Gemini API key';
            break;
          }

          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildFallbackBody()),
          });
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMessage =
            errData?.error?.message || `Model ${modelName} returned status ${response.status}`;
          lastError = errMessage;

          // Detect quota exhaustion (429) or auth failure (401/403)
          if (response.status === 401 || response.status === 403) {
            // Key unauthorized or disabled -> cooldown 10m and switch to next key immediately
            keyCooldownUntil.set(apiKey, Date.now() + 10 * 60 * 1000);
            break;
          }

          if (
            response.status === 429 ||
            errMessage.toLowerCase().includes('quota') ||
            errMessage.toLowerCase().includes('resource_exhausted') ||
            errMessage.toLowerCase().includes('rate limit')
          ) {
            // Key quota exhausted -> cooldown 60s
            keyCooldownUntil.set(apiKey, Date.now() + 60 * 1000);
            // If we have other keys in the pool, immediately switch to the next key!
            if (totalKeys > 1) {
              break;
            }
          }

          continue;
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          // Key succeeded! Clear any cooldown and advance the loop pointer for round-robin balance
          keyCooldownUntil.delete(apiKey);
          keyLoopPointer = (keyIdx + 1) % totalKeys;
          return text;
        }
      } catch (fetchErr) {
        lastError = fetchErr.message;
      }
    }
  }

  throw new Error(lastError || 'All API keys and candidate AI models failed to generate a response.');
}

/**
 * Normalizes messy raw markdown from LLMs into clean, properly spaced lines
 */
function cleanAndFormatAiMarkdown(text) {
  if (!text) return '';
  let s = text;

  // 1. Remove clumps of multiple asterisks (e.g. **** or ***)
  s = s.replace(/\*{3,}/g, '**');

  // 2. Fix glued label-value pairs like "**Hotline:** * **0869...**"
  s = s.replace(/:\*\*\s*\*\s*\*\*/g, ': **');

  // 3. Break inline numbered steps onto their own newlines
  s = s.replace(/(\s+)(\d+\.\s+\*\*)/g, '\n\n$2');

  // 4. Break inline bullets that were glued with asterisks
  s = s.replace(/(\s+)\*\s+\*\*/g, '\n- **');
  s = s.replace(/\*\s*\*\s*\*\*/g, '\n- **');

  // 5. Transform inline pseudo-headings (e.g. "**3. Quy trình...**") to proper markdown headers
  s = s.replace(/(^|\n)\*\*(\d+\.\s+[^*]+?)\*\*\s*/g, '\n\n### $2\n\n');
  s = s.replace(/(^|\n)\*\*(Thông tin liên hệ|Contact Information|Lưu ý|Cam kết[^*]*?)\*\*\s*/gi, '\n\n### $2\n\n');

  // 6. Strip trailing or lone asterisks
  s = s.replace(/(\s+)\*\s*$/gm, '');
  s = s.replace(/^\s*\*\s*$/gm, '');

  // 7. Normalize double newlines between headings and paragraphs
  s = s.replace(/(###[^\n]+)\n([^\n#])/g, '$1\n\n$2');
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}


