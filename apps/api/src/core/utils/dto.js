/**
 * Strips internal fields from a Mongoose document or plain object for public API responses.
 * If locale is provided, flattens localized fields (objects with { vi, en }) to a plain string.
 */
export function sanitizePublicDTO(doc, locale) {
  if (!doc) return doc;
  
  let obj = typeof doc.toObject === 'function' ? doc.toObject({ virtuals: true }) : { ...doc };
  
  // Remove internal fields
  delete obj.__v;
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.isDeleted;
  delete obj.deletedAt;
  delete obj.deletedBy;
  delete obj.passwordHash;
  delete obj.salt;

  if (locale) {
    // Recursively flatten localized fields { vi, en } -> string
    const flatten = (val) => {
      if (Array.isArray(val)) return val.map(flatten);
      if (val !== null && typeof val === 'object') {
        if (val.vi !== undefined || val.en !== undefined) {
           return val[locale] !== undefined ? val[locale] : (val.vi || val.en || '');
        }
        
        // avoid messing up Dates or ObjectIds
        if (val instanceof Date || val.constructor?.name === 'ObjectId') return val;
        
        const res = {};
        for (const [k, v] of Object.entries(val)) {
           res[k] = flatten(v);
        }
        return res;
      }
      return val;
    };
    obj = flatten(obj);
  }

  return obj;
}
