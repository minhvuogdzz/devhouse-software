import { connectDB, disconnectDB } from '../src/core/db/connection.js';
import { logger } from '../src/core/logger/index.js';
import { SEEDED_ROLES } from '@devhouse/shared';
import {
  defaultCategories,
  defaultTechnologies,
  defaultServices,
  defaultSolutions,
  defaultNavigation,
  PAGE_REGISTRY,
} from '@devhouse/content';

import { RoleModel } from '../src/modules/roles/role.model.js';
import { CategoryModel } from '../src/modules/categories/category.model.js';
import { TechnologyModel } from '../src/modules/technologies/technology.model.js';
import { ServiceModel } from '../src/modules/services/service.model.js';
import { SolutionModel } from '../src/modules/solutions/solution.model.js';
import { SettingsModel } from '../src/modules/settings/settings.model.js';
import { NavigationModel } from '../src/modules/navigation/navigation.model.js';
import { PageModel } from '../src/modules/content/page.model.js';

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
        },
      },
      { upsert: true },
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

  // 4. Seed Services
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
          order: service.order,
          status: service.status,
          publishedAt: service.publishedAt,
          features: service.features,
          seo: service.seo,
          locales: ['vi', 'en'],
        },
      },
      { upsert: true },
    );
  }
  logger.info('Seeded services.');

  // 5. Seed Solutions
  for (const solution of defaultSolutions) {
    await SolutionModel.updateOne(
      { 'slug.vi': solution.slug.vi },
      {
        $setOnInsert: {
          name: solution.name,
          slug: solution.slug,
          shortDescription: solution.shortDescription,
          description: solution.description,
          targetAudience: solution.targetAudience,
          order: solution.order,
          status: solution.status,
          publishedAt: solution.publishedAt,
          seo: solution.seo,
          locales: ['vi', 'en'],
        },
      },
      { upsert: true },
    );
  }
  logger.info('Seeded solutions.');

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

  // 7. Seed Navigation
  await NavigationModel.updateOne(
    { key: 'main' },
    {
      $setOnInsert: {
        key: 'main',
        header: defaultNavigation.header,
        footer: defaultNavigation.footer,
      },
    },
    { upsert: true },
  );
  logger.info('Seeded navigation.');

  // 8. Seed Page Records
  for (const pageKey of Object.keys(PAGE_REGISTRY)) {
    await PageModel.updateOne(
      { key: pageKey },
      {
        $setOnInsert: {
          key: pageKey,
          sections: {}, // Sparse overrides; code defaults take precedence
          seo: {
            title: PAGE_REGISTRY[pageKey].seo?.title || { vi: '', en: '' },
            description: PAGE_REGISTRY[pageKey].seo?.description || { vi: '', en: '' },
          },
        },
      },
      { upsert: true },
    );
  }
  logger.info('Seeded pages.');

  logger.info('Database seeding completed successfully.');
}

// Direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
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
