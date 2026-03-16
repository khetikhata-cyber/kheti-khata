const Joi = require('joi');

const createDealerSchema = Joi.object({
  dealerId:  Joi.string().required(),
  shopName:  Joi.string().trim().min(1).max(100).required(),
  ownerName: Joi.string().trim().max(100).allow(null, '').optional(),
  phone:     Joi.string().pattern(/^[6-9]\d{9}$/).allow(null, '').optional()
    .messages({ 'string.pattern.base': 'Enter a valid 10-digit mobile number' }),
});

const updateDealerSchema = Joi.object({
  shopName:  Joi.string().trim().min(1).max(100).optional(),
  ownerName: Joi.string().trim().max(100).allow(null, '').optional(),
  phone:     Joi.string().pattern(/^[6-9]\d{9}$/).allow(null, '').optional(),
});

const markPaymentSchema = Joi.object({
  amount: Joi.number().positive().required()
    .messages({ 'any.required': 'Payment amount is required' }),
});

module.exports = { createDealerSchema, updateDealerSchema, markPaymentSchema };
