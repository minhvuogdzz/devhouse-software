import mongoose from 'mongoose';

/**
 * Shared by export-content.js and import-content.js: which collections are the website's content,
 * and how to recognise the same record in two different databases.
 *
 * Not synced on purpose: users, roles, sessions, tokens, audit logs and contact requests. They
 * hold passwords, logins and visitors' personal details, and each database has its own.
 */

export const { EJSON, ObjectId } = mongoose.mongo.BSON;

/** In the order they are written. */
export const CONTENT_COLLECTIONS = [
  'categories',
  'media',
  'technologies',
  'services',
  'packages',
  'products',
  'solutions',
  'projects',
  'authors',
  'tags',
  'blog_posts',
  'redirects',
  'pages',
  'navigation_menus',
  'site_settings',
];

/** Who made or deleted a record means nothing in another database, so it is not carried over. */
export const USER_FIELDS = ['createdBy', 'updatedBy', 'deletedBy', 'uploadedBy'];

/** The filter that finds the same record in another database, or null if there is no way to tell. */
export function naturalKey(collection, doc) {
  const notDeleted = { isDeleted: { $ne: true } };
  switch (collection) {
    case 'pages':
    case 'navigation_menus':
    case 'site_settings':
      return doc.key ? { key: doc.key } : null;
    case 'media':
      return doc.publicId ? { publicId: doc.publicId, ...notDeleted } : null;
    case 'categories':
      return doc.slug?.vi ? { type: doc.type, 'slug.vi': doc.slug.vi } : null;
    case 'redirects':
      return doc.from ? { from: doc.from } : null;
    default: {
      if (typeof doc.slug === 'string') return { slug: doc.slug, ...notDeleted };
      if (doc.slug?.vi) return { 'slug.vi': doc.slug.vi, ...notDeleted };
      return null;
    }
  }
}
