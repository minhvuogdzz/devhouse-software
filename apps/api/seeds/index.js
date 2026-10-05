import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { logger } from '../src/core/logger/index.js';
import { SEEDED_ROLES, SEEDED_ROLES_REVISION } from '@devhouse/shared';
import {
  defaultCategories,
  defaultTechnologies,
  defaultServices,
  defaultServiceTypes,
  defaultPackages,
} from '@devhouse/content';

import { RoleModel } from '../src/modules/roles/role.model.js';
import { CategoryModel } from '../src/modules/categories/category.model.js';
import { TechnologyModel } from '../src/modules/technologies/technology.model.js';
import { ServiceModel } from '../src/modules/services/service.model.js';
import { PackageModel } from '../src/modules/packages/package.model.js';
import { SettingsModel } from '../src/modules/settings/settings.model.js';

export async function runSeeds() {
  logger.info('Starting idempotent database seed...');

  // 1. Seed Roles
  for (const role of Object.values(SEEDED_ROLES)) {
    await RoleModel.updateOne(
      { key: role.key },
      {
        $setOnInsert: {
          key: role.key,
          name: role.name,
          description: role.description,
          isSystem: role.isSystem,
          permissions: role.permissions,
          seedRevision: SEEDED_ROLES_REVISION,
        },
      },
      { upsert: true },
    );

    // Roles created by an earlier release gain the permissions added since, exactly once.
    // Nothing is ever removed, so changes an admin made to a role are kept.
    // A role created before this field existed has no revision at all, which counts as the oldest.
    await RoleModel.updateOne(
      {
        key: role.key,
        $or: [
          { seedRevision: { $exists: false } },
          { seedRevision: { $lt: SEEDED_ROLES_REVISION } },
        ],
      },
      {
        $addToSet: { permissions: { $each: role.permissions } },
        $set: { seedRevision: SEEDED_ROLES_REVISION },
      },
    );
  }
  logger.info('Seeded system roles.');

  // 2. Seed Categories
  const categoryMap = new Map();
  for (const cat of defaultCategories) {
    const existing = await CategoryModel.findOneAndUpdate(
      { type: cat.type, 'slug.vi': cat.slug.vi },
      {
        $setOnInsert: {
          type: cat.type,
          slug: cat.slug,
          name: cat.name,
          description: cat.description,
          order: cat.order,
        },
      },
      { upsert: true, new: true },
    );
    categoryMap.set(`${cat.type}:${cat.slug.vi}`, existing._id);
  }
  logger.info('Seeded categories.');

  // 3. Seed Technologies
  const techMap = new Map();
  for (const tech of defaultTechnologies) {
    const catId = categoryMap.get(`technology:${tech.categorySlug}`) || null;
    const existing = await TechnologyModel.findOneAndUpdate(
      { slug: tech.slug },
      {
        $setOnInsert: {
          name: tech.name,
          slug: tech.slug,
          category: catId,
          categorySlug: tech.categorySlug,
          description: tech.description,
          icon: tech.icon,
          websiteUrl: tech.websiteUrl,
          order: tech.order,
          status: tech.status,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).setOptions({ withDeleted: true });
    techMap.set(tech.slug, existing._id);
  }
  logger.info('Seeded technologies.');

  // 4. Seed Services: the four service groups, then the kinds of service inside each group
  const groupIds = new Map();
  for (const service of defaultServices) {
    await ServiceModel.updateOne(
      { 'slug.vi': service.slug.vi },
      {
        $setOnInsert: {
          name: service.name,
          slug: service.slug,
          shortDescription: service.shortDescription,
          description: service.description,
          icon: service.icon,
          billing: service.billing,
          order: service.order,
          status: service.status,
          publishedAt: service.publishedAt,
          features: service.features,
          faqs: service.faqs,
          process: service.process,
          seo: service.seo,
          locales: ['vi', 'en'],
        },
      },
      { upsert: true },
    );
    // A group saved by an earlier release has no setup steps yet: add them once, never overwrite
    await ServiceModel.updateOne(
      { 'slug.vi': service.slug.vi, process: { $exists: false } },
      { $set: { process: service.process } },
    );
    const group = await ServiceModel.findOne({ 'slug.vi': service.slug.vi }).select('_id').lean();
    groupIds.set(service.slug.vi, group._id);
  }
  for (const item of defaultServiceTypes) {
    await ServiceModel.updateOne(
      { 'slug.vi': item.slug.vi },
      {
        $setOnInsert: {
          name: item.name,
          slug: item.slug,
          parent: groupIds.get(item.parentSlug),
          shortDescription: item.shortDescription,
          description: item.description,
          icon: item.icon,
          billing: item.billing,
          order: item.order,
          status: item.status,
          publishedAt: item.publishedAt,
          features: item.features,
          faqs: item.faqs,
          process: item.process,
          locales: ['vi', 'en'],
        },
      },
      { upsert: true },
    );
  }
  logger.info('Seeded services.');

  // 5. Seed Packages (prices stay empty until an admin sets them)
  for (const pack of defaultPackages) {
    await PackageModel.updateOne(
      { 'slug.vi': pack.slug.vi },
      {
        $setOnInsert: {
          name: pack.name,
          slug: pack.slug,
          audience: pack.audience,
          shortDescription: pack.shortDescription,
          inclusions: pack.inclusions,
          supportHours: pack.supportHours,
          setupFee: pack.setupFee,
          recurringFee: pack.recurringFee,
          recurringPeriod: pack.recurringPeriod,
          currency: pack.currency,
          priceNote: pack.priceNote,
          isFeatured: pack.isFeatured,
          order: pack.order,
          status: pack.status,
          publishedAt: pack.publishedAt,
          locales: ['vi', 'en'],
        },
      },
      { upsert: true },
    );
  }
  logger.info('Seeded packages.');

  // 6. Seed Site Settings
  await SettingsModel.updateOne(
    { key: 'global' },
    {
      $setOnInsert: {
        key: 'global',
        data: {}, // Sparse overrides; code defaults take precedence
      },
    },
    { upsert: true },
  );
  logger.info('Seeded settings.');

  // Navigation and pages are NOT copied into the database. Code defaults apply until an admin
  // edits them, so improving a default in a release reaches every site that has not customized it.

  logger.info('Database seeding completed successfully.');
}

import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Direct execution
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  connectDB()
    .then(runSeeds)
    .then(async () => {
      await disconnectDB();
      process.exit(0);
    })
    .catch(async err => {
      logger.error(`Seed error: ${err.message}`);
      await disconnectDB();
      process.exit(1);
    });
}
