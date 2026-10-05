import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from '../src/config/index.js';
import { CONTENT_COLLECTIONS, EJSON, USER_FIELDS } from './content-sync.js';

/**
 * Writes the website's content (pages, menus, settings, services, packages, templates, projects,
 * categories, pictures...) from the database this machine points to into one JSON file.
 *
 *   node scripts/export-content.js [file]       default: seeds/content-export.json
 *
 * Read only. Deleted records are left out, and so are users, roles, sessions and audit logs.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.argv[2] || path.join(here, '..', 'seeds', 'content-export.json'));

await mongoose.connect(config.MONGODB_URI, {
  dbName: config.MONGODB_DB_NAME,
  serverSelectionTimeoutMS: 8000,
});
const db = mongoose.connection.db;

const collections = {};
for (const name of CONTENT_COLLECTIONS) {
  const docs = await db
    .collection(name)
    .find({ isDeleted: { $ne: true } })
    .toArray();
  if (!docs.length) continue;
  for (const doc of docs) for (const field of USER_FIELDS) delete doc[field];
  collections[name] = docs;
  console.log(`${name.padEnd(20)} ${docs.length}`);
}

const payload = {
  exportedAt: new Date().toISOString(),
  source: config.MONGODB_DB_NAME,
  collections,
};
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, `${EJSON.stringify(payload, { relaxed: false }, 2)}\n`);
console.log(`\nWritten: ${file}`);
await mongoose.disconnect();
