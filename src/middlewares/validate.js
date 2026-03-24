const { sendValidationError } = require('../utils/apiResponse');

/**
 * Validate request body against a Joi schema.
 * Usage: router.post('/route', validate(mySchema), controller)
 */
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    console.error('Validation error:', errors, { body: req.body });
    return sendValidationError(res, errors);
  }
  next();
};

module.exports = validate;
