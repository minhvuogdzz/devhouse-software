import { ValidationError } from '../errors/index.js';

export const validate = schemas => {
  return (req, _res, next) => {
    try {
      req.valid = req.valid || {};

      if (schemas.params) {
        req.valid.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.valid.query = schemas.query.parse(req.query);
      }
      if (schemas.body) {
        req.valid.body = schemas.body.parse(req.body);
      }

      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        const details = err.issues.map(issue => ({
          path: issue.path.join('.'),
          code: issue.code,
          message: issue.message,
        }));
        return next(new ValidationError(details, 'Request validation failed'));
      }
      next(err);
    }
  };
};
