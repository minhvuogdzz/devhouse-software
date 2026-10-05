import { execSync } from 'node:child_process';
import fs from 'node:fs';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Tests must never touch the development, staging or production database.
 * They run against a throw-away in-memory MongoDB, or against TEST_MONGODB_URI when set
 * (for example a MongoDB service container in CI). The URI is handed to every test file
 * through `inject('testMongoUri')` (see setup-env.js).
 */

function findSystemMongod() {
  const candidates = [
    '/opt/homebrew/opt/mongodb-community/bin/mongod',
    '/usr/local/opt/mongodb-community/bin/mongod',
    '/usr/local/bin/mongod',
    '/usr/bin/mongod',
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  try {
    return execSync('command -v mongod', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

let mongod;

export async function setup(project) {
  if (process.env.TEST_MONGODB_URI) {
    project.provide('testMongoUri', process.env.TEST_MONGODB_URI);
    return;
  }

  // Prefer a mongod that is already installed; otherwise mongodb-memory-server downloads one.
  if (!process.env.MONGOMS_SYSTEM_BINARY) {
    const systemBinary = findSystemMongod();
    if (systemBinary) {
      process.env.MONGOMS_SYSTEM_BINARY = systemBinary;
      process.env.MONGOMS_VERSION_CHECK = process.env.MONGOMS_VERSION_CHECK || 'false';
      process.env.MONGOMS_SYSTEM_BINARY_VERSION_CHECK = 'false';
    }
  }

  mongod = await MongoMemoryServer.create();
  project.provide('testMongoUri', mongod.getUri());
}

export async function teardown() {
  if (mongod) await mongod.stop();
}
