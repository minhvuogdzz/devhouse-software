import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { logger } from '../src/core/logger/index.js';
import { config } from '../src/config/index.js';
import { UserModel } from '../src/modules/users/user.model.js';

export async function createAdmin() {
  const email = (process.argv[2] || config.SEED_ADMIN_EMAIL || 'admin@devhouse.example')
    .toLowerCase()
    .trim();
  const defaultPassword = process.env.SEED_ADMIN_PASSWORD || 'DevHouseAdmin2026!';

  logger.info(`Checking super admin user: ${email}`);

  const existing = await UserModel.findOne({ email });
  if (existing) {
    logger.info(`User ${email} already exists. Skipping admin creation.`);
    return existing;
  }

  const passwordHash = await UserModel.hashPassword(defaultPassword);

  const adminUser = await UserModel.create({
    email,
    passwordHash,
    name: 'Dev House Super Administrator',
    roleKeys: ['super_admin'],
    status: 'active',
    mustChangePassword: false,
  });

  logger.info(`Super Administrator created successfully!`);
  logger.info(`Email: ${email}`);
  logger.info(`Temporary Password: ${defaultPassword}`);
  logger.info(`Please log in and update the password immediately.`);

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
