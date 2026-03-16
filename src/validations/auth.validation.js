const Joi = require('joi');

const registerSchema = Joi.object({
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Enter a valid 10-digit Indian mobile number',
      'any.required': 'Mobile number is required',
    }),
});

const loginSchema = Joi.object({
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({ 'string.pattern.base': 'Enter a valid 10-digit Indian mobile number' }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  village: Joi.string().trim().max(100).optional().allow('', null),
  district: Joi.string().trim().max(100).optional().allow('', null),
  state: Joi.string().trim().max(100).optional().allow('', null),
});

module.exports = { registerSchema, loginSchema, updateProfileSchema };
