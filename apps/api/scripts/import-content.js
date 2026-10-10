import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { config } from '../src/config/index.js';
import { CONTENT_COLLECTIONS, EJSON, ObjectId, naturalKey } from './content-sync.js';

/**
 * Puts the content written by export-content.js into the database this machine points to.
 *
 *   node scripts/import-content.js [file] [--dry-run]     default file: seeds/content-export.json
 *
 * - Safe to run again: it gives the same result every time.
 * - A record that already exists (same page key, slug, picture...) is updated in place and keeps its
 *   id; a new one is added. Nothing is ever deleted, and nothing outside the content is touched.
 * - Links between records (a service's group, a template's category, pictures...) are rewritten to
 *   the ids this database uses, so they do not break.
 * - --dry-run shows what would happen and writes nothing.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const file = path.resolve(
  args.find(arg => !arg.startsWith('--')) || path.join(here, '..', 'seeds', 'content-export.json'),
);

const payload = EJSON.parse(fs.readFileSync(file, 'utf8'));
await mongoose.connect(config.MONGODB_URI, {
  dbName: config.MONGODB_DB_NAME,
  serverSelectionTimeoutMS: 8000,
});
const db = mongoose.connection.db;
console.log(
  `${dryRun ? '[dry run] ' : ''}Content from "${payload.source}" (${payload.exportedAt}) → ${config.MONGODB_DB_NAME}\n`,
);

// Pass 1: which id does each record have in this database?
const idMap = new Map(); // id in the file → id here
const plan = {};
for (const name of CONTENT_COLLECTIONS) {
  const docs = payload.collections?.[name] || [];
  plan[name] = { added: 0, updated: 0 };
  for (const doc of docs) {
    const key = naturalKey(name, doc);
    const existing = key
      ? await db.collection(name).findOne(key, { projection: { _id: 1 } })
      : null;
    const hereId = existing ? existing._id : doc._id;
    idMap.set(String(doc._id), hereId);
    plan[name][existing ? 'updated' : 'added'] += 1;
  }
}

// Ids inside a record, as ObjectId or as text, point to this database's ids
const HEX_ID = /^[a-f0-9]{24}$/;
function remap(value) {
  if (value instanceof ObjectId) return idMap.get(String(value)) ?? value;
  if (typeof value === 'string' && HEX_ID.test(value)) return idMap.get(value)?.toString() ?? value;
  if (Array.isArray(value)) return value.map(remap);
  if (value && typeof value === 'object' && !(value instanceof Date) && !value._bsontype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remap(v)]));
  }
  return value;
}

// Pass 2: write
for (const name of CONTENT_COLLECTIONS) {
  const docs = payload.collections?.[name] || [];
  if (!docs.length) continue;
  const { added, updated } = plan[name];
  console.log(`${name.padEnd(20)} ${added} new, ${updated} updated`);
  if (dryRun) continue;
  for (const doc of docs) {
    const id = idMap.get(String(doc._id));
    const { _id, ...rest } = doc;
    const remapped = remap(rest);
    if (name === 'site_settings') {
      const current = await db.collection(name).findOne({ _id: id });
      if (current?.data) {
        remapped.data = {
          ...current.data,
          ...remapped.data,
          ai: remapped.data?.ai || current.data.ai,
          socialLinks: remapped.data?.socialLinks || current.data.socialLinks,
          floatingContacts: remapped.data?.floatingContacts || current.data.floatingContacts,
        };
      }
    }
    await db
      .collection(name)
      .replaceOne({ _id: id }, { ...remapped, _id: id }, { upsert: true });
  }
}

console.log(dryRun ? '\nDry run only, nothing was written.' : '\nDone.');
await mongoose.disconnect();
