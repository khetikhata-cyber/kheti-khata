const Joi = require('joi');

const createLoanSchema = Joi.object({
  loanId:       Joi.string().required(),
  lenderName:   Joi.string().trim().min(1).max(100).required(),
  amount:       Joi.number().positive().required(),
  repaidAmount: Joi.number().min(0).default(0),
  interestRate: Joi.number().min(0).max(100).default(0),
  dueDate:      Joi.number().allow(null).optional(),
});

const updateLoanSchema = Joi.object({
  lenderName:   Joi.string().trim().min(1).max(100).optional(),
  amount:       Joi.number().positive().optional(),
  repaidAmount: Joi.number().min(0).optional(),
  interestRate: Joi.number().min(0).max(100).optional(),
  dueDate:      Joi.number().allow(null).optional(),
  status:       Joi.string().valid('active', 'closed', 'overdue').optional(),
});

module.exports = { createLoanSchema, updateLoanSchema };
