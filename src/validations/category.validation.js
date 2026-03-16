const Joi = require('joi');

const createCategorySchema = Joi.object({
  name:            Joi.string().trim().min(1).max(100).required()
    .messages({ 'any.required': 'Category name is required' }),
  nameHindi:       Joi.string().trim().max(100).allow(null, '').optional(),
  phase:           Joi.string()
    .valid('pre_sowing', 'sowing', 'management', 'harvest', 'sale', 'any')
    .required()
    .messages({ 'any.required': 'Phase is required' }),
  iconKey:         Joi.string().allow(null, '').optional(),
  hasSubCategory:  Joi.boolean().default(false),
  hasLabourFields: Joi.boolean().default(false),
});

module.exports = { createCategorySchema };
