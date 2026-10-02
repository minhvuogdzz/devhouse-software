import crypto from 'node:crypto';
import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { logger } from '../src/core/logger/index.js';
import { config } from '../src/config/index.js';
import { UserModel } from '../src/modules/users/user.model.js';

const MIN_PASSWORD_LENGTH = 12;
const GENERATED_PASSWORD_LENGTH = 20;

function generateSecurePassword(length) {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*()-_=+';
  const all = upper + lower + digits + special;

  // Guarantee at least one of each class
  let password = '';
  password += upper[crypto.randomInt(upper.length)];
  password += lower[crypto.randomInt(lower.length)];
  password += digits[crypto.randomInt(digits.length)];
  password += special[crypto.randomInt(special.length)];

  for (let i = password.length; i < length; i++) {
    password += all[crypto.randomInt(all.length)];
  }

  // Shuffle with Fisher-Yates
  const arr = password.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export async function createAdmin() {
  const email = (process.argv[2] || config.SEED_ADMIN_EMAIL || 'admin@devhouse.example')
    .toLowerCase()
    .trim();

  // Password from environment, or randomly generated — never hardcoded
  let password = process.env.SEED_ADMIN_PASSWORD || '';
  let wasGenerated = false;

  if (!password) {
    password = generateSecurePassword(GENERATED_PASSWORD_LENGTH);
    wasGenerated = true;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `ERROR: Password must be at least ${MIN_PASSWORD_LENGTH} characters (policy §16.3). Received ${password.length}.`,
    );
    process.exit(1);
  }

  logger.info(`Checking super admin user: ${email}`);

  const existing = await UserModel.findOne({ email });
  if (existing) {
    logger.info(`User ${email} already exists. Skipping admin creation.`);
    return existing;
  }

  const passwordHash = await UserModel.hashPassword(password);

  const adminUser = await UserModel.create({
    email,
    passwordHash,
    name: 'Dev House Super Administrator',
    roleKeys: ['super_admin'],
    status: 'active',
    mustChangePassword: true,
  });

  logger.info(`Super Administrator created successfully.`);
  logger.info(`Email: ${email}`);

  // Print the password to the terminal only — never to the log file or repo
  if (wasGenerated) {
    process.stdout.write(`\n  Generated password: ${password}\n`);
  } else {
    process.stdout.write(`\n  Password accepted from SEED_ADMIN_PASSWORD.\n`);
  }
  process.stdout.write(`  This account requires a password change on first login.\n\n`);

  return adminUser;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB()
    .then(createAdmin)
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async err => {
      logger.error(`Create admin error: ${err.message}`);
      await disconnectDB();
      process.exit(1);
    });
}
