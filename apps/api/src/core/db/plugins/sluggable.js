import { slugify } from '@devhouse/shared';

export const sluggablePlugin = (schema, options = {}) => {
  const { source = 'name', localized = false } = options;

  if (localized) {
    schema.add({
      slug: {
        vi: { type: String, trim: true },
        en: { type: String, trim: true },
      },
    });

    schema.pre('validate', function (next) {
      if (this.isModified(source) || !this.slug?.vi) {
        if (!this.slug) this.slug = {};
        const sourceVi = this.get(`${source}.vi`);
        if (sourceVi && !this.slug.vi) {
          this.slug.vi = slugify(sourceVi);
        }
        const sourceEn = this.get(`${source}.en`);
        if (sourceEn && !this.slug.en) {
          this.slug.en = slugify(sourceEn);
        }
      }
      next();
    });
  } else {
    schema.add({
      slug: { type: String, trim: true, index: true },
    });

    schema.pre('validate', function (next) {
      if (this.isModified(source) || !this.slug) {
        const sourceVal = this.get(source);
        if (sourceVal && !this.slug) {
          this.slug = slugify(sourceVal);
        }
      }
      next();
    });
  }
};
