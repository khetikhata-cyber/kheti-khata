const Expense = require('../models/Expense.model');
const Crop = require('../models/Crop.model');
const AppError = require('../utils/AppError');
const {
  getRestoreUpdate,
  getSoftDeleteUpdate,
  restoreCropIfNeeded,
} = require('../utils/trashRestore.helper');

const getExpensesByCrop = async (cropId, farmerId, filters = {}) => {
  const query = { cropId, farmerId, deletedAt: null };
  if (filters.phase) query.phase = filters.phase;

  return Expense.find(query).sort({ date: -1 });
};

const createExpense = async (farmerId, data) => {
  // verify category exists and belongs to this farmer or is system
  // const category = await ExpenseCategory.findOne({
  //   categoryId: data.categoryId,
  //   isActive: true,
  //   $or: [{ farmerId: null }, { farmerId }],
  // });

  // if (!category) throw new AppError('Category not found or not accessible', 404);

  const crop = await Crop.findOne({ cropId: data.cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  const pendingAmount = data.amount - (data.paidAmount || 0);

  const expense = await Expense.create({
    ...data,
    farmerId,
    pendingAmount,
    paymentStatus: pendingAmount <= 0 ? 'paid' : data.paidAmount > 0 ? 'partial' : 'pending',
  });

  const cropUpdate = {
    ...(data.phase !== 'sale' ? { $inc: { totalExpenses: data.amount } } : {}),

    ...(data.phase === 'sale' ? { $set: { salePrice: data.amount } } : {}),
  };

  await Crop.findOneAndUpdate({ cropId: data.cropId, farmerId, deletedAt: null }, cropUpdate);

  return expense;
};

const updateExpense = async (expenseId, farmerId, data) => {
  const expense = await Expense.findOne({ expenseId, farmerId, deletedAt: null });
  if (!expense) throw new AppError('Expense not found', 404);

  if (data.amount !== undefined || data.paidAmount !== undefined) {
    const amount = data.amount ?? expense.amount;
    const paidAmount = data.paidAmount ?? expense.paidAmount;
    data.pendingAmount = amount - paidAmount;
    data.paymentStatus = data.pendingAmount <= 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'pending';
  }

  const updated = await Expense.findOneAndUpdate(
    { expenseId, farmerId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  return updated;
};

const softDeleteExpense = async (expenseId, farmerId) => {
  const expense = await Expense.findOne({ expenseId, farmerId, deletedAt: null });
  if (!expense) throw new AppError('Expense not found', 404);

  await Expense.findOneAndUpdate(
    { expenseId, farmerId },
    getSoftDeleteUpdate({ farmerId, deletedAt: Date.now() })
  );

  return { deleted: true };
};

const restoreExpense = async (expenseId, farmerId) => {
  const expense = await Expense.findOne({ _id: expenseId, farmerId, deletedAt: { $ne: null } });
  if (!expense) throw new AppError('Expense not found in trash', 404);

  const restoredAncestors = [];
  await restoreCropIfNeeded(expense.cropId, farmerId, restoredAncestors);

  await Expense.findOneAndUpdate({ _id: expenseId, farmerId }, getRestoreUpdate());
  return { restored: true, restoredAncestors };
};

const getTrashExpenses = async (farmerId) => {
  return Expense.find({
    farmerId,
    deletedAt: { $ne: null },
    deletedParentType: null,
    deletedParentId: null,
  }).sort({ deletedAt: -1 });
};

module.exports = {
  getExpensesByCrop,
  createExpense,
  updateExpense,
  softDeleteExpense,
  restoreExpense,
  getTrashExpenses,
};
