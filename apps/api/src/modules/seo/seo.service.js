import { ServiceModel } from '../services/service.model.js';
import { SolutionModel } from '../solutions/solution.model.js';
import { ProjectModel } from '../projects/project.model.js';
import { TechnologyModel } from '../technologies/technology.model.js';
import { BlogPostModel } from '../blog/post.model.js';
import { redirectService } from '../redirects/redirect.service.js';
import { cache } from '../../core/cache/index.js';
import { config } from '../../config/index.js';

export const seoService = {
  async getSitemapData() {
    const cacheKey = 'seo:sitemap:data';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const baseUrl = config.WEB_URL.replace(/\/+$/, '');

    // 1. Static pages
    const staticRoutes = [
      { path: '', changefreq: 'daily', priority: 1.0 },
      { path: '/services', changefreq: 'weekly', priority: 0.9 },
      { path: '/solutions', changefreq: 'weekly', priority: 0.9 },
      { path: '/projects', changefreq: 'weekly', priority: 0.8 },
      { path: '/technologies', changefreq: 'weekly', priority: 0.8 },
      { path: '/blog', changefreq: 'daily', priority: 0.8 },
      { path: '/about', changefreq: 'monthly', priority: 0.7 },
      { path: '/contact', changefreq: 'monthly', priority: 0.8 },
      { path: '/careers', changefreq: 'monthly', priority: 0.6 },
      { path: '/privacy', changefreq: 'yearly', priority: 0.3 },
      { path: '/terms', changefreq: 'yearly', priority: 0.3 },
    ];

    const entries = [];

    for (const r of staticRoutes) {
      const locVi = `${baseUrl}${r.path || '/'}`;
      const locEn = `${baseUrl}/en${r.path}`;

      entries.push({
        loc: locVi,
        locale: 'vi',
        changefreq: r.changefreq,
        priority: r.priority,
        alternates: [
          { lang: 'vi', href: locVi },
          { lang: 'en', href: locEn },
        ],
      });

      entries.push({
        loc: locEn,
        locale: 'en',
        changefreq: r.changefreq,
        priority: r.priority,
        alternates: [
          { lang: 'vi', href: locVi },
          { lang: 'en', href: locEn },
        ],
      });
    }

    // 2. Published Catalog & Blog
    const [services, solutions, projects, technologies, posts] = await Promise.all([
      ServiceModel.find({ isDeleted: false, status: 'published' }).select('slug updatedAt').lean(),
      SolutionModel.find({ isDeleted: false, status: 'published' }).select('slug updatedAt').lean(),
      ProjectModel.find({ isDeleted: false, status: 'published', isConfidential: { $ne: true } })
        .select('slug updatedAt')
        .lean(),
      TechnologyModel.find({ isDeleted: false, status: 'published' })
        .select('slug updatedAt')
        .lean(),
      BlogPostModel.find({
        isDeleted: false,
        status: 'published',
        publishedAt: { $lte: new Date() },
      })
        .select('slug updatedAt publishedAt')
        .lean(),
    ]);

    const addLocalizedEntries = (items, prefix, priority = 0.8, changefreq = 'weekly') => {
      for (const item of items) {
        if (!item.slug?.vi || !item.slug?.en) continue;

        const locVi = `${baseUrl}${prefix}/${item.slug.vi}`;
        const locEn = `${baseUrl}/en${prefix}/${item.slug.en}`;
        const lastmod = item.updatedAt || item.publishedAt || new Date();

        entries.push({
          loc: locVi,
          locale: 'vi',
          lastmod,
          changefreq,
          priority,
          alternates: [
            { lang: 'vi', href: locVi },
            { lang: 'en', href: locEn },
          ],
        });

        entries.push({
          loc: locEn,
          locale: 'en',
          lastmod,
          changefreq,
          priority,
          alternates: [
            { lang: 'vi', href: locVi },
            { lang: 'en', href: locEn },
          ],
        });
      }
    };

    addLocalizedEntries(services, '/services', 0.8, 'weekly');
    addLocalizedEntries(solutions, '/solutions', 0.8, 'weekly');
    addLocalizedEntries(projects, '/projects', 0.7, 'monthly');
    addLocalizedEntries(technologies, '/technologies', 0.7, 'monthly');
    addLocalizedEntries(posts, '/blog', 0.7, 'weekly');

    cache.set(cacheKey, entries, { tags: ['seo', 'content'], ttlMs: 300000 });
    return entries;
  },

  async resolveRedirect(path) {
    return redirectService.resolve(path);
  },
};
