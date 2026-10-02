import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '..', '..', '..', '..', '.env');

dotenv.config({ path: rootEnvPath });

const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(4000),
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(1),

  WEB_URL: z.string().default('http://localhost:3000'),
  ADMIN_URL: z.string().default('http://localhost:5173'),

  MONGODB_URI: z.string().default('mongodb://localhost:27017'),
  MONGODB_DB_NAME: z.string().default('devhouse_dev'),

  SESSION_COOKIE_NAME: z.string().default('dh_sid'),
  SESSION_IDLE_TTL_MINUTES: z.coerce.number().int().positive().default(480),
  SESSION_ABSOLUTE_TTL_DAYS: z.coerce.number().int().positive().default(7),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_FOLDER_PREFIX: z.string().default('devhouse/dev'),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  MAIL_FROM: z.string().default('Dev House Software <no-reply@devhouse.example>'),
  CONTACT_NOTIFY_TO: z.string().default('devhousesoftware.inc@gmail.com'),

  CAPTCHA_PROVIDER: z.enum(['none', 'turnstile']).default('none'),
  CAPTCHA_SECRET_KEY: z.string().optional().default(''),

  DEFAULT_LOCALE: z.string().default('vi'),
  SUPPORTED_LOCALES: z.string().default('vi,en'),

  SEED_ADMIN_EMAIL: z.string().email().optional().default('admin@devhouse.example'),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  // Print human-readable error and exit
  console.error(
    'Invalid environment configuration:',
    JSON.stringify(parsed.error.format(), null, 2),
  );
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const config = parsed.success ? parsed.data : configSchema.parse({});
export { rootEnvPath };

// Log which database we are connecting to (never the password)
if (process.env.NODE_ENV !== 'test') {
  try {
    const u = new URL(config.MONGODB_URI);
    console.info(`[config] MongoDB target → ${u.host}/${config.MONGODB_DB_NAME}`);
  } catch {
    console.info(`[config] MongoDB target → ${config.MONGODB_URI} / ${config.MONGODB_DB_NAME}`);
  }
}
