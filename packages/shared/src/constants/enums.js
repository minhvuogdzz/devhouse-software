export const STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const STATUS_LIST = Object.values(STATUS);

export const CATEGORY_TYPES = {
  SERVICE: 'service',
  SOLUTION: 'solution',
  PROJECT: 'project',
  TECHNOLOGY: 'technology',
};

export const CATEGORY_TYPE_LIST = Object.values(CATEGORY_TYPES);

export const CONTACT_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
};

export const CONTACT_STATUS_LIST = Object.values(CONTACT_STATUS);

export const AUDIT_ACTIONS = {
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGOUT: 'auth.logout',
  SERVICE_CREATE: 'service.create',
  SERVICE_UPDATE: 'service.update',
  SERVICE_DELETE: 'service.delete',
  SERVICE_PUBLISH: 'service.publish',
  SOLUTION_CREATE: 'solution.create',
  SOLUTION_UPDATE: 'solution.update',
  SOLUTION_DELETE: 'solution.delete',
  SOLUTION_PUBLISH: 'solution.publish',
  PROJECT_CREATE: 'project.create',
  PROJECT_UPDATE: 'project.update',
  PROJECT_DELETE: 'project.delete',
  PROJECT_PUBLISH: 'project.publish',
  TECHNOLOGY_CREATE: 'technology.create',
  TECHNOLOGY_UPDATE: 'technology.update',
  TECHNOLOGY_DELETE: 'technology.delete',
  BLOG_CREATE: 'blog.create',
  BLOG_UPDATE: 'blog.update',
  BLOG_DELETE: 'blog.delete',
  BLOG_PUBLISH: 'blog.publish',
  CATEGORY_MANAGE: 'category.manage',
  PAGE_UPDATE: 'page.update',
  PAGE_RESET: 'page.reset',
  SETTINGS_UPDATE: 'settings.update',
  NAVIGATION_UPDATE: 'navigation.update',
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',
  CONTACT_UPDATE: 'contact.update',
  CONTACT_DELETE: 'contact.delete',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_ROLES_UPDATE: 'user.roles.update',
  ROLE_MANAGE: 'role.manage',
};
