const Joi = require('joi');

const createCropSchema = Joi.object({
  cropId:       Joi.string().required(),
  fieldId:      Joi.string().required(),
  name:         Joi.string().trim().min(1).max(100).required(),
  variety:      Joi.string().allow(null, '').optional(),
  cropPhotoKey: Joi.string().allow(null, '').optional(),
  sowingDate:   Joi.number().required(),
  expectedDays: Joi.number().integer().min(1).required(),
  hasBataidaar: Joi.boolean().default(false),
});

const updateCropSchema = Joi.object({
  name:         Joi.string().trim().min(1).max(100).optional(),
  variety:      Joi.string().allow(null, '').optional(),
  expectedDays: Joi.number().integer().min(1).optional(),
  status:       Joi.string().valid('active', 'harvested', 'settled').optional(),
  hasBataidaar: Joi.boolean().optional(),
  bataidaarId:  Joi.string().allow(null, '').optional(),
});

module.exports = { createCropSchema, updateCropSchema };
