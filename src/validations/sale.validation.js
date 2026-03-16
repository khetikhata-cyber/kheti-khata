const Joi = require('joi');

const createSaleSchema = Joi.object({
  saleId:       Joi.string().required(),
  productionId: Joi.string().required(),
  cropId:       Joi.string().required(),
  quantity:     Joi.number().positive().required(),
  ratePerUnit:  Joi.number().positive().required(),
  buyerType:    Joi.string().valid('mandi', 'trader', 'fpo', 'direct', 'other').required(),
  buyerName:    Joi.string().trim().allow(null, '').optional(),
  marketName:   Joi.string().trim().allow(null, '').optional(),
  saleDate:     Joi.number().required(),
});

const updateSaleSchema = Joi.object({
  quantity:    Joi.number().positive().optional(),
  ratePerUnit: Joi.number().positive().optional(),
  buyerType:   Joi.string().valid('mandi', 'trader', 'fpo', 'direct', 'other').optional(),
  buyerName:   Joi.string().trim().allow(null, '').optional(),
  marketName:  Joi.string().trim().allow(null, '').optional(),
  saleDate:    Joi.number().optional(),
});

module.exports = { createSaleSchema, updateSaleSchema };
