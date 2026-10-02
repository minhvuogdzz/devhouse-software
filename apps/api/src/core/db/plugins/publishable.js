export const publishablePlugin = schema => {
  schema.add({
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
  });

  schema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }
    next();
  });

  schema.query.published = function () {
    return this.where({
      status: 'published',
      publishedAt: { $lte: new Date() },
    });
  };
};
