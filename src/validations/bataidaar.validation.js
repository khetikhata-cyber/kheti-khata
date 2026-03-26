const Joi = require('joi');

const createBataidaarSchema = Joi.object({
  // bataidaarId: Joi.string().required(),
  name: Joi.string().trim().min(1).max(100).required(),
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Enter a valid 10-digit Indian mobile number',
      'any.required': 'Mobile number is required',
    }),
  // sharePercent:     Joi.number().min(0).max(99).optional()
  // .messages({ 'number.min': 'Share must be at least 0%', 'number.max': 'Share cannot exceed 99%' }),
  // responsibilities: Joi.array().items(Joi.string()).default([]),
});

const updateBataidaarSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Enter a valid 10-digit Indian mobile number',
    }),
  // sharePercent:     Joi.number().min(0).max(99).optional(),
  // responsibilities: Joi.array().items(Joi.string()).optional(),
});

module.exports = { createBataidaarSchema, updateBataidaarSchema };
