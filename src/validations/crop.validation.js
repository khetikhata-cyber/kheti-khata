const Joi = require('joi');

const createCropSchema = Joi.object({
  // cropId:       Joi.string().required(),
  fieldId: Joi.string().required(),
  name: Joi.string().trim().min(1).max(100).required(),
  variety: Joi.string().allow(null, '').optional(),
  cropPhotoKey: Joi.string().allow(null, '').optional(),
  sowingDate: Joi.string().required(),
  expectedDays: Joi.number().integer().min(1).required(),
  salePrice: Joi.number().min(0).optional(),
  hasBataidaar: Joi.boolean().default(false),
  bataidaarId: Joi.string().allow(null, '').optional(),
  sharePercent: Joi.number().optional(),
});

const updateCropSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  variety: Joi.string().allow(null, '').optional(),
  expectedDays: Joi.number().integer().min(1).optional(),
  salePrice: Joi.number().min(0).optional(),
  status: Joi.string().valid('active', 'completed').optional(),
  hasBataidaar: Joi.boolean().optional(),
  bataidaarId: Joi.string().allow(null, '').optional(),
  sharePercent: Joi.number().optional(),
});

const filterCompletedCropsSchema = Joi.object({
  fromDate: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required(),
  toDate: Joi.string()
    .pattern(/^\d{2}\/\d{2}\/\d{4}$/)
    .required(),
});

module.exports = { createCropSchema, updateCropSchema, filterCompletedCropsSchema };
