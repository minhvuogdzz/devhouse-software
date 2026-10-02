import { ServiceModel } from '../services/service.model.js';
import { SolutionModel } from '../solutions/solution.model.js';
import { ProjectModel } from '../projects/project.model.js';
import { TechnologyModel } from '../technologies/technology.model.js';
import { BlogPostModel } from '../blog/post.model.js';
import { AuthorModel } from '../blog/author.model.js';
import { TagModel } from '../blog/tag.model.js';
import { MediaModel } from '../media/media.model.js';
import { UserModel } from '../users/user.model.js';
import { ContactRequestModel } from '../contact/contact.model.js';
import { AuditLogModel } from '../audit-logs/audit-log.model.js';
import { cache } from '../../core/cache/index.js';

export const dashboardService = {
  async getSummary() {
    const cacheKey = 'dashboard:summary';
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const now = new Date();

    const [
      servicesTotal,
      servicesPublished,
      solutionsTotal,
      solutionsPublished,
      projectsTotal,
      projectsPublished,
      techTotal,
      techPublished,
      postsTotal,
      postsPublished,
      authorsTotal,
      tagsTotal,
      mediaTotal,
      usersTotal,
      newContactCount,
      recentContacts,
      recentPostsDrafts,
      recentProjectsDrafts,
      recentServicesDrafts,
      scheduledPosts,
      recentActivity,
    ] = await Promise.all([
      ServiceModel.countDocuments({ isDeleted: false }),
      ServiceModel.countDocuments({ isDeleted: false, status: 'published' }),
      SolutionModel.countDocuments({ isDeleted: false }),
      SolutionModel.countDocuments({ isDeleted: false, status: 'published' }),
      ProjectModel.countDocuments({ isDeleted: false }),
      ProjectModel.countDocuments({ isDeleted: false, status: 'published' }),
      TechnologyModel.countDocuments({ isDeleted: false }),
      TechnologyModel.countDocuments({ isDeleted: false, status: 'published' }),
      BlogPostModel.countDocuments({ isDeleted: false }),
      BlogPostModel.countDocuments({ isDeleted: false, status: 'published' }),
      AuthorModel.countDocuments(),
      TagModel.countDocuments(),
      MediaModel.countDocuments({ isDeleted: false }),
      UserModel.countDocuments({ isDeleted: false }),
      ContactRequestModel.countDocuments({ isDeleted: false, status: 'new' }),
      ContactRequestModel.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email subject status createdAt')
        .lean(),
      BlogPostModel.find({ isDeleted: false, status: 'draft' })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title slug updatedAt')
        .lean(),
      ProjectModel.find({ isDeleted: false, status: 'draft' })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title slug updatedAt')
        .lean(),
      ServiceModel.find({ isDeleted: false, status: 'draft' })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('name slug updatedAt')
        .lean(),
      BlogPostModel.find({
        isDeleted: false,
        status: 'published',
        publishedAt: { $gt: now },
      })
        .sort({ publishedAt: 1 })
        .limit(5)
        .select('title slug publishedAt')
        .lean(),
      AuditLogModel.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    const drafts = [
      ...recentPostsDrafts.map(p => ({
        type: 'post',
        title: p.title?.vi || p.title?.en || p.slug?.vi,
        updatedAt: p.updatedAt,
      })),
      ...recentProjectsDrafts.map(p => ({
        type: 'project',
        title: p.title?.vi || p.title?.en || p.slug?.vi,
        updatedAt: p.updatedAt,
      })),
      ...recentServicesDrafts.map(s => ({
        type: 'service',
        title: s.name?.vi || s.name?.en || s.slug?.vi,
        updatedAt: s.updatedAt,
      })),
    ]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);

    const summary = {
      counts: {
        services: {
          total: servicesTotal,
          published: servicesPublished,
          draft: servicesTotal - servicesPublished,
        },
        solutions: {
          total: solutionsTotal,
          published: solutionsPublished,
          draft: solutionsTotal - solutionsPublished,
        },
        projects: {
          total: projectsTotal,
          published: projectsPublished,
          draft: projectsTotal - projectsPublished,
        },
        technologies: {
          total: techTotal,
          published: techPublished,
          draft: techTotal - techPublished,
        },
        posts: { total: postsTotal, published: postsPublished, draft: postsTotal - postsPublished },
        authors: { total: authorsTotal },
        tags: { total: tagsTotal },
        media: { total: mediaTotal },
        users: { total: usersTotal },
      },
      newContactRequests: newContactCount,
      recentContactRequests: recentContacts,
      drafts,
      scheduled: scheduledPosts,
      recentActivity,
    };

    cache.set(cacheKey, summary, { ttlMs: 30000, tags: ['dashboard'] });
    return summary;
  },
};
