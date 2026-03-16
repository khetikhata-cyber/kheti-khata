const Dealer = require('../models/Dealer.model');
const Expense = require('../models/Expense.model');
const AppError = require('../utils/AppError');

const getAllDealers = async (farmerId) => {
  return Dealer.find({ farmerId }).sort({ createdAt: -1 });
};

const getDealerById = async (dealerId, farmerId) => {
  const dealer = await Dealer.findOne({ dealerId, farmerId });
  if (!dealer) throw new AppError('Dealer not found', 404);
  return dealer;
};

/**
 * Get dealer with full expense ledger
 */
const getDealerLedger = async (dealerId, farmerId) => {
  const dealer = await Dealer.findOne({ dealerId, farmerId });
  if (!dealer) throw new AppError('Dealer not found', 404);

  const expenses = await Expense.find({ shopId: dealerId, farmerId, deletedAt: null })
    .sort({ date: -1 });

  return { dealer, expenses };
};

const createDealer = async (farmerId, data) => {
  return Dealer.create({ ...data, farmerId });
};

const updateDealer = async (dealerId, farmerId, data) => {
  const dealer = await Dealer.findOne({ dealerId, farmerId });
  if (!dealer) throw new AppError('Dealer not found', 404);

  return Dealer.findOneAndUpdate(
    { dealerId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
};

/**
 * Mark payment to dealer — reduces outstanding balance
 */
const markPayment = async (dealerId, farmerId, amount) => {
  const dealer = await Dealer.findOne({ dealerId, farmerId });
  if (!dealer) throw new AppError('Dealer not found', 404);

  const newBalance = Math.max(0, dealer.outstandingBalance - amount);

  return Dealer.findOneAndUpdate(
    { dealerId },
    { outstandingBalance: newBalance, updatedAt: Date.now() },
    { new: true }
  );
};

const deleteDealer = async (dealerId, farmerId) => {
  const dealer = await Dealer.findOne({ dealerId, farmerId });
  if (!dealer) throw new AppError('Dealer not found', 404);
  await Dealer.deleteOne({ dealerId });
  return { deleted: true };
};

module.exports = {
  getAllDealers,
  getDealerById,
  getDealerLedger,
  createDealer,
  updateDealer,
  markPayment,
  deleteDealer,
};
