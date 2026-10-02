import { LOCALES } from '@devhouse/shared';

export const localizedPlugin = (schema, options = {}) => {
  const { requiredFields = ['name', 'shortDescription'] } = options;

  schema.add({
    locales: {
      type: [String],
      default: ['vi'],
      index: true,
    },
  });

  schema.pre('save', function (next) {
    const availableLocales = [];

    for (const locale of LOCALES) {
      const isComplete = requiredFields.every(field => {
        const val = this.get(`${field}.${locale}`) ?? this.get(field);
        return typeof val === 'string' ? val.trim().length > 0 : !!val;
      });

      if (isComplete) {
        availableLocales.push(locale);
      }
    }

    // Default to at least 'vi' if empty
    this.locales = availableLocales.length > 0 ? availableLocales : ['vi'];
    next();
  });
};
