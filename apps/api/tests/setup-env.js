import { inject } from 'vitest';

/**
 * Runs before every test file, before any application module is imported.
 * Points the API at the throw-away test database and switches off third-party services,
 * so a test can never write to the real database, Cloudinary or an SMTP server.
 */
process.env.MONGODB_URI = inject('testMongoUri');
process.env.MONGODB_DB_NAME = 'devhouse_test';

for (const key of [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SENTRY_DSN',
]) {
  process.env[key] = '';
}
