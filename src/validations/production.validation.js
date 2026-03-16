const Joi = require('joi');

const createProductionSchema = Joi.object({
  productionId:  Joi.string().required(),
  cropId:        Joi.string().required(),
  totalQuantity: Joi.number().positive().required(),
  unit:          Joi.string().valid('quintal', 'kg', 'maan', 'ton').required(),
  harvestDate:   Joi.number().required(),
});

const updateProductionSchema = Joi.object({
  totalQuantity: Joi.number().positive().optional(),
  unit:          Joi.string().valid('quintal', 'kg', 'maan', 'ton').optional(),
  harvestDate:   Joi.number().optional(),
  unsoldBalance: Joi.number().min(0).optional(),
});

module.exports = { createProductionSchema, updateProductionSchema };
