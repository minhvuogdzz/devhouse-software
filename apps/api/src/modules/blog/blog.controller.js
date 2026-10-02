import { blogService } from './blog.service.js';
import { sendSuccess, sendPaginated } from '../../core/http/index.js';

export const blogController = {
  // Public
  async listPosts(req, res) {
    const result = await blogService.listPublicPosts(req.query);
    return sendPaginated(res, result.data, result.pagination);
  },

  async getPostBySlug(req, res) {
    const post = await blogService.getPublicPostBySlug(req.params.slug, req.query.locale);
    return sendSuccess(res, post);
  },

  async listTags(req, res) {
    const tags = await blogService.listPublicTags(req.query.locale);
    return sendSuccess(res, tags);
  },

  async getAuthor(req, res) {
    const author = await blogService.getPublicAuthor(req.params.slug, req.query.locale);
    return sendSuccess(res, author);
  },

  // Admin Posts
  async adminListPosts(req, res) {
    const result = await blogService.listAdminPosts(req.query);
    return sendPaginated(res, result.data, result.pagination);
  },

  async adminGetPostById(req, res) {
    const post = await blogService.getAdminPostById(req.params.id);
    return sendSuccess(res, post);
  },

  async adminCreatePost(req, res) {
    const hasPublish =
      req.auth?.permissions?.includes('*') || req.auth?.permissions?.includes('blog:publish');
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const post = await blogService.createAdminPost(req.body, hasPublish, callerId);
    return sendSuccess(res, post, 201);
  },

  async adminUpdatePost(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const post = await blogService.updateAdminPost(req.params.id, req.body, callerId);
    return sendSuccess(res, post);
  },

  async adminUpdatePostStatus(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const post = await blogService.updateAdminPostStatus(req.params.id, req.body, callerId);
    return sendSuccess(res, post);
  },

  async adminDeletePost(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    await blogService.softDeleteAdminPost(req.params.id, callerId);
    return res.status(204).end();
  },

  async adminRestorePost(req, res) {
    const post = await blogService.restoreAdminPost(req.params.id);
    return sendSuccess(res, post);
  },

  // Admin Authors
  async adminListAuthors(_req, res) {
    const authors = await blogService.listAdminAuthors();
    return sendSuccess(res, authors);
  },

  async adminCreateAuthor(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const author = await blogService.createAdminAuthor(req.body, callerId);
    return sendSuccess(res, author, 201);
  },

  async adminUpdateAuthor(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const author = await blogService.updateAdminAuthor(req.params.id, req.body, callerId);
    return sendSuccess(res, author);
  },

  async adminDeleteAuthor(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    await blogService.deleteAdminAuthor(req.params.id, callerId);
    return res.status(204).end();
  },

  // Admin Tags
  async adminListTags(_req, res) {
    const tags = await blogService.listAdminTags();
    return sendSuccess(res, tags);
  },

  async adminCreateTag(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const tag = await blogService.createAdminTag(req.body, callerId);
    return sendSuccess(res, tag, 201);
  },

  async adminUpdateTag(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const tag = await blogService.updateAdminTag(req.params.id, req.body, callerId);
    return sendSuccess(res, tag);
  },

  async adminDeleteTag(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    await blogService.deleteAdminTag(req.params.id, callerId);
    return res.status(204).end();
  },
};
