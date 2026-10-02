import { MediaModel } from './media.model.js';
import { cloudinary } from '../../integrations/cloudinary/index.js';
import { audit } from '../../core/audit/index.js';
import { parseListQuery } from '../../core/query/index.js';
import { NotFoundError, ConflictError } from '../../core/errors/index.js';
import { ERROR_CODES } from '@devhouse/shared';

// Models for media usage check
import { ServiceModel } from '../services/service.model.js';
import { SolutionModel } from '../solutions/solution.model.js';
import { ProjectModel } from '../projects/project.model.js';
import { TechnologyModel } from '../technologies/technology.model.js';
import { BlogPostModel } from '../blog/post.model.js';
import { AuthorModel } from '../blog/author.model.js';

export const mediaService = {
  getUploadSignature(options) {
    return cloudinary.generateSignature(options);
  },

  async registerMedia(data, callerId) {
    const verified = cloudinary.verifyUpload(data);
    if (!verified) {
      throw new ConflictError('Upload signature verification failed', ERROR_CODES.VALIDATION_ERROR);
    }

    const existing = await MediaModel.findOne({ publicId: data.publicId, isDeleted: false });
    if (existing) {
      throw new ConflictError('Media asset already registered', ERROR_CODES.CONFLICT);
    }

    const media = await MediaModel.create({
      ...data,
      uploadedBy: callerId,
    });

    await audit.record({
      action: 'media.create',
      resource: { type: 'media', id: media._id.toString(), label: media.publicId },
      changes: { publicId: media.publicId, format: media.format, bytes: media.bytes },
    });

    return media;
  },

  async listMedia(rawQuery) {
    const parsed = parseListQuery(rawQuery, {
      allowedSortFields: ['createdAt', 'bytes', 'title'],
      defaultSort: 'createdAt',
    });

    const filter = {};
    if (rawQuery.deleted === 'true') {
      filter.isDeleted = true;
    } else {
      filter.isDeleted = false;
    }

    if (rawQuery.folder) {
      filter.folder = rawQuery.folder;
    }

    if (rawQuery.resourceType) {
      filter.resourceType = rawQuery.resourceType;
    }

    if (rawQuery.tag) {
      filter.tags = rawQuery.tag;
    }

    const search =
      rawQuery.search && typeof rawQuery.search === 'string' ? rawQuery.search.trim() : '';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    let countQuery = MediaModel.countDocuments(filter);
    let findQuery = MediaModel.find(filter)
      .sort(parsed.sort)
      .skip(parsed.skip)
      .limit(parsed.limit)
      .populate('uploadedBy', 'name email')
      .lean();

    if (rawQuery.deleted === 'true') {
      countQuery = countQuery.setOptions({ withDeleted: true });
      findQuery = findQuery.setOptions({ withDeleted: true });
    }

    const [total, docs] = await Promise.all([countQuery, findQuery]);

    return {
      data: docs,
      pagination: {
        page: parsed.page,
        limit: parsed.limit,
        total,
        totalPages: Math.ceil(total / parsed.limit),
        hasNext: parsed.page < Math.ceil(total / parsed.limit),
        hasPrev: parsed.page > 1,
      },
    };
  },

  async getMediaById(id) {
    const media = await MediaModel.findById(id).populate('uploadedBy', 'name email');
    if (!media) {
      throw new NotFoundError('Media asset not found');
    }
    return media;
  },

  async updateMedia(id, data, _callerId) {
    const media = await MediaModel.findById(id);
    if (!media) {
      throw new NotFoundError('Media asset not found');
    }

    const allowed = ['title', 'alt', 'isDecorative', 'caption', 'folder', 'tags'];
    const changes = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        media[key] = data[key];
        changes[key] = data[key];
      }
    }

    await media.save();

    await audit.record({
      action: 'media.update',
      resource: { type: 'media', id: media._id.toString(), label: media.publicId },
      changes,
    });

    return media;
  },

  async getMediaUsage(id) {
    const media = await MediaModel.findById(id);
    if (!media) {
      throw new NotFoundError('Media asset not found');
    }

    const usages = [];
    const mediaIdStr = media._id.toString();
    const publicId = media.publicId;

    // 1. Services
    const services = await ServiceModel.find({
      isDeleted: false,
      $or: [
        { 'coverImage.mediaId': mediaIdStr },
        { 'coverImage.publicId': publicId },
        { 'gallery.mediaId': mediaIdStr },
        { 'gallery.publicId': publicId },
      ],
    }).lean();
    for (const s of services) {
      usages.push({
        resourceType: 'service',
        id: s._id.toString(),
        label: s.title?.vi || s.title?.en || s.slug?.vi,
        path: `/services/${s.slug?.vi}`,
      });
    }

    // 2. Solutions
    const solutions = await SolutionModel.find({
      isDeleted: false,
      $or: [
        { 'coverImage.mediaId': mediaIdStr },
        { 'coverImage.publicId': publicId },
        { 'gallery.mediaId': mediaIdStr },
        { 'gallery.publicId': publicId },
      ],
    }).lean();
    for (const sol of solutions) {
      usages.push({
        resourceType: 'solution',
        id: sol._id.toString(),
        label: sol.title?.vi || sol.title?.en || sol.slug?.vi,
        path: `/solutions/${sol.slug?.vi}`,
      });
    }

    // 3. Projects
    const projects = await ProjectModel.find({
      isDeleted: false,
      $or: [
        { 'coverImage.mediaId': mediaIdStr },
        { 'coverImage.publicId': publicId },
        { 'gallery.mediaId': mediaIdStr },
        { 'gallery.publicId': publicId },
      ],
    }).lean();
    for (const p of projects) {
      usages.push({
        resourceType: 'project',
        id: p._id.toString(),
        label: p.title?.vi || p.title?.en || p.slug?.vi,
        path: `/projects/${p.slug?.vi}`,
      });
    }

    // 4. Technologies
    const technologies = await TechnologyModel.find({
      isDeleted: false,
      $or: [{ 'icon.mediaId': mediaIdStr }, { 'icon.publicId': publicId }],
    }).lean();
    for (const t of technologies) {
      usages.push({
        resourceType: 'technology',
        id: t._id.toString(),
        label: t.name?.vi || t.name?.en || t.slug?.vi,
        path: `/technologies/${t.slug?.vi}`,
      });
    }

    // 5. Blog posts
    const posts = await BlogPostModel.find({
      isDeleted: false,
      $or: [
        { 'coverImage.mediaId': mediaIdStr },
        { 'coverImage.publicId': publicId },
        { 'featuredImage.mediaId': mediaIdStr },
        { 'featuredImage.publicId': publicId },
      ],
    }).lean();
    for (const post of posts) {
      usages.push({
        resourceType: 'blog_post',
        id: post._id.toString(),
        label: post.title?.vi || post.title?.en || post.slug?.vi,
        path: `/blog/${post.slug?.vi}`,
      });
    }

    // 6. Authors
    const authors = await AuthorModel.find({
      $or: [{ 'avatar.mediaId': mediaIdStr }, { 'avatar.publicId': publicId }],
    }).lean();
    for (const a of authors) {
      usages.push({
        resourceType: 'author',
        id: a._id.toString(),
        label: a.name,
        path: `/blog/authors/${a.slug}`,
      });
    }

    return usages;
  },

  async deleteMedia(id, { force = false } = {}, callerId) {
    const media = await MediaModel.findById(id);
    if (!media) {
      throw new NotFoundError('Media asset not found');
    }

    const usages = await this.getMediaUsage(id);
    if (usages.length > 0 && !force) {
      throw new ConflictError(
        'Media asset is currently in use across one or more resources',
        ERROR_CODES.MEDIA_IN_USE,
        { usages },
      );
    }

    await media.softDelete(callerId);
    await cloudinary.destroy(media.publicId, {
      resourceType: media.resourceType,
      invalidate: true,
    });

    await audit.record({
      action: 'media.delete',
      resource: { type: 'media', id: media._id.toString(), label: media.publicId },
      changes: { force, usagesCount: usages.length },
    });
  },

  async createImageRefSnapshot(mediaId, customAlt = null) {
    const media = await MediaModel.findById(mediaId);
    if (!media) {
      throw new NotFoundError('Referenced media asset not found');
    }

    return {
      mediaId: media._id.toString(),
      publicId: media.publicId,
      url: media.url,
      width: media.width,
      height: media.height,
      format: media.format,
      alt: customAlt || media.alt || { vi: '', en: '' },
    };
  },
};
