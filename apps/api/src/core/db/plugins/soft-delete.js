export const softDeletePlugin = schema => {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: String,
      default: null,
    },
  });

  // Filter out deleted documents by default in queries unless withDeleted is explicitly set
  schema.pre(/^find/, function () {
    if (!this.getOptions().withDeleted) {
      this.where({ isDeleted: false });
    }
  });

  schema.pre(/^count/, function () {
    if (!this.getOptions().withDeleted) {
      this.where({ isDeleted: false });
    }
  });

  schema.methods.softDelete = function (actorId = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = actorId;
    return this.save();
  };

  schema.methods.restore = function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };
};
