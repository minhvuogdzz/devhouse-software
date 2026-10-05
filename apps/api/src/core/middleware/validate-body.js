import { validate } from './validate.js';

/**
 * Validates req.body with a Zod schema and replaces it with the parsed result, so controllers
 * only ever see known fields with defaults applied (unknown keys are dropped).
 * Spread it into a route: router.post('/', ...validateBody(Schema), handler)
 */
export const validateBody = schema => [
  validate({ body: schema }),
  (req, _res, next) => {
    req.body = req.valid.body;
    next();
  },
];
