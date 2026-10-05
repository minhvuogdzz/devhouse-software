import mongoose from 'mongoose';
import { CategoryModel } from './category.model.js';

const NO_MATCH = new mongoose.Types.ObjectId('000000000000000000000000');

/**
 * Turns a category id or slug (from a query string) into an ObjectId.
 * An unknown slug resolves to an id that matches nothing, so the list comes back empty
 * instead of ignoring the filter.
 */
export async function resolveCategoryId(value, types) {
  if (typeof value !== 'string') return NO_MATCH;
  if (/^[a-f\d]{24}$/i.test(value)) return new mongoose.Types.ObjectId(value);
  const category = await CategoryModel.findOne({
    type: { $in: types },
    $or: [{ 'slug.vi': value }, { 'slug.en': value }],
  })
    .select('_id')
    .lean();
  return category ? category._id : NO_MATCH;
}
