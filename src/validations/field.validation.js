const Joi = require('joi');

const createFieldSchema = Joi.object({
  fieldId:        Joi.string().required(),
  name:           Joi.string().trim().min(1).max(100).required(),
  areaValue:      Joi.number().positive().required(),
  areaUnit:       Joi.string().valid('bigha', 'acre', 'guntha', 'hectare').required(),
  irrigationType: Joi.string().valid('borewell', 'canal', 'rainfed').required(),
  khasraNumber:   Joi.string().allow('', null).optional(),
});

const updateFieldSchema = Joi.object({
  name:           Joi.string().trim().min(1).max(100).optional(),
  areaValue:      Joi.number().positive().optional(),
  areaUnit:       Joi.string().valid('bigha', 'acre', 'guntha', 'hectare').optional(),
  irrigationType: Joi.string().valid('borewell', 'canal', 'rainfed').optional(),
  khasraNumber:   Joi.string().allow('', null).optional(),
});

module.exports = { createFieldSchema, updateFieldSchema };
