const Joi = require('joi');

const createBataidaarSchema = Joi.object({
  bataidaarId:      Joi.string().required(),
  cropId:           Joi.string().required(),
  name:             Joi.string().trim().min(1).max(100).required(),
  sharePercent:     Joi.number().min(1).max(99).required()
    .messages({ 'number.min': 'Share must be at least 1%', 'number.max': 'Share cannot exceed 99%' }),
  responsibilities: Joi.array().items(Joi.string()).default([]),
});

const updateBataidaarSchema = Joi.object({
  name:             Joi.string().trim().min(1).max(100).optional(),
  sharePercent:     Joi.number().min(1).max(99).optional(),
  responsibilities: Joi.array().items(Joi.string()).optional(),
});

module.exports = { createBataidaarSchema, updateBataidaarSchema };
