const Settlement = require('../models/Settlement.model');
const Crop = require('../models/Crop.model');
const Expense = require('../models/Expense.model');
const Sale = require('../models/Sale.model');
const Bataidaar = require('../models/Bataidaar.model');
const Field = require('../models/Field.model');
const AppError = require('../utils/AppError');
const { v4: uuidv4 } = require('uuid');

/**
 * Core settlement calculation engine (pure function — no DB writes)
 * Matches PRD Section 12 exactly
 */
const calculateSettlement = ({ expenses, sales, bataidaar, areaAcres }) => {
  // Total expense = sum of all non-deleted expenses
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Total income = sum of (quantity × ratePerUnit) across all sales
  const totalIncome = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const profitLoss = totalIncome - totalExpense;
  const profitPerAcre = areaAcres > 0 ? profitLoss / areaAcres : 0;

  // Bataidaar calculations
  let bataidaarShareValue = 0;
  let bataidaarExpensesPaid = 0;
  let netPayable = 0;
  let payableDirection = 'settled';

  if (bataidaar) {
    bataidaarShareValue = (bataidaar.sharePercent / 100) * totalIncome;
    bataidaarExpensesPaid = expenses
      .filter((e) => e.paidBy === 'bataidaar')
      .reduce((sum, e) => sum + e.amount, 0);

    netPayable = bataidaarShareValue - bataidaarExpensesPaid;

    if (netPayable > 0) payableDirection = 'farmerPays';
    else if (netPayable < 0) payableDirection = 'bataidaarPays';
    else payableDirection = 'settled';
  }

  return {
    totalExpense:          parseFloat(totalExpense.toFixed(2)),
    totalIncome:           parseFloat(totalIncome.toFixed(2)),
    profitLoss:            parseFloat(profitLoss.toFixed(2)),
    profitPerAcre:         parseFloat(profitPerAcre.toFixed(2)),
    bataidaarShareValue:   parseFloat(bataidaarShareValue.toFixed(2)),
    bataidaarExpensesPaid: parseFloat(bataidaarExpensesPaid.toFixed(2)),
    netPayable:            parseFloat(Math.abs(netPayable).toFixed(2)),
    payableDirection,
  };
};

/**
 * Preview settlement (calculate without saving — for settlement screen)
 */
const previewSettlement = async (cropId, farmerId) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  const field = await Field.findOne({ fieldId: crop.fieldId, farmerId });
  if (!field) throw new AppError('Field not found', 404);

  const [expenses, sales, bataidaar] = await Promise.all([
    Expense.find({ cropId, farmerId, deletedAt: null }),
    Sale.find({ cropId, farmerId, deletedAt: null }),
    crop.bataidaarId ? Bataidaar.findOne({ _id: crop.bataidaarId, deletedAt: null }) : null,
  ]);

  const result = calculateSettlement({
    expenses,
    sales,
    bataidaar,
    areaAcres: field.areaAcres,
  });

  return { ...result, crop, field, bataidaar, expenseCount: expenses.length, saleCount: sales.length };
};

/**
 * Finalize settlement — saves snapshot and marks crop as settled
 */
const finalizeSettlement = async (cropId, farmerId, pdfUrl = null) => {
  // prevent double settlement
  const existing = await Settlement.findOne({ cropId, farmerId });
  if (existing) throw new AppError('This crop has already been settled', 409);

  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  if (crop.status === 'active') {
    throw new AppError('Crop must be harvested before settlement', 400);
  }

  const field = await Field.findOne({ fieldId: crop.fieldId, farmerId });
  const [expenses, sales, bataidaar] = await Promise.all([
    Expense.find({ cropId, farmerId, deletedAt: null }),
    Sale.find({ cropId, farmerId, deletedAt: null }),
    crop.bataidaarId ? Bataidaar.findOne({ _id: crop.bataidaarId, deletedAt: null }) : null,
  ]);

  const calculated = calculateSettlement({
    expenses,
    sales,
    bataidaar,
    areaAcres: field.areaAcres,
  });

  // Save immutable settlement snapshot
  const settlement = await Settlement.create({
    settlementId: uuidv4(),
    cropId,
    farmerId,
    pdfUrl,
    ...calculated,
  });

  // Mark crop as settled
  await Crop.findOneAndUpdate({ cropId }, { status: 'settled', updatedAt: Date.now() });

  return settlement;
};

const getSettlementByCrop = async (cropId, farmerId) => {
  const settlement = await Settlement.findOne({ cropId, farmerId });
  if (!settlement) throw new AppError('Settlement not found for this crop', 404);
  return settlement;
};

const getAllSettlements = async (farmerId) => {
  return Settlement.find({ farmerId }).sort({ settledAt: -1 });
};

module.exports = {
  previewSettlement,
  finalizeSettlement,
  getSettlementByCrop,
  getAllSettlements,
};
