import { getActor } from '../../context/index.js';

export const auditablePlugin = schema => {
  schema.add({
    createdBy: {
      type: String,
      default: null,
    },
    updatedBy: {
      type: String,
      default: null,
    },
  });

  schema.pre('save', function (next) {
    const actor = getActor();
    const actorId = actor?.id || actor?._id || null;

    if (this.isNew && !this.createdBy && actorId) {
      this.createdBy = actorId.toString();
    }
    if (actorId) {
      this.updatedBy = actorId.toString();
    }
    next();
  });
};
