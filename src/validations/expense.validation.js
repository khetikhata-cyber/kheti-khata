const Joi = require('joi');

const createExpenseSchema = Joi.object({
  expenseId:    Joi.string().required(),
  cropId:       Joi.string().required(),
  categoryId:   Joi.string().required(),
  categoryName: Joi.string().required(),
  shopId:       Joi.string().allow(null, '').optional(),
  phase:        Joi.string().valid('pre_sowing', 'sowing', 'management', 'harvest', 'sale').required(),
  subCategory:  Joi.string().allow(null, '').optional(),
  date:         Joi.number().required(),
  amount:       Joi.number().min(0).required(),
  paidAmount:   Joi.number().min(0).default(0),
  paidBy:       Joi.string().valid('farmer', 'bataidaar').required(),
  paymentStatus:Joi.string().valid('paid', 'pending', 'partial').default('pending'),
  labourDetails: Joi.object({
    numWorkers: Joi.number().integer().min(1).required(),
    ratePerDay: Joi.number().min(1).required(),
    numDays:    Joi.number().min(0.5).required(),
  }).allow(null).optional(),
  receiptUrl:   Joi.string().uri().allow(null, '').optional(),
  remarks:      Joi.string().max(500).allow(null, '').optional(),
  isOwnedAsset: Joi.boolean().default(false),
});

const updateExpenseSchema = Joi.object({
  amount:        Joi.number().min(0).optional(),
  paidAmount:    Joi.number().min(0).optional(),
  paidBy:        Joi.string().valid('farmer', 'bataidaar').optional(),
  paymentStatus: Joi.string().valid('paid', 'pending', 'partial').optional(),
  labourDetails: Joi.object({
    numWorkers: Joi.number().integer().min(1).required(),
    ratePerDay: Joi.number().min(1).required(),
    numDays:    Joi.number().min(0.5).required(),
  }).allow(null).optional(),
  remarks:       Joi.string().max(500).allow(null, '').optional(),
  receiptUrl:    Joi.string().uri().allow(null, '').optional(),
  date:          Joi.number().optional(),
});

module.exports = { createExpenseSchema, updateExpenseSchema };
