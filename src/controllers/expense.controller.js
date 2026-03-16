const expenseService = require('../services/expense.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getExpenses = asyncHandler(async (req, res) => {
  const { cropId } = req.params;
  const { phase } = req.query;
  const expenses = await expenseService.getExpensesByCrop(cropId, req.farmer.farmerId, { phase });
  return sendSuccess(res, {
    message: 'Expenses fetched',
    data: expenses,
    meta: { count: expenses.length },
  });
});

const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Expense added successfully', data: expense });
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(
    req.params.expenseId,
    req.farmer.farmerId,
    req.body
  );
  return sendSuccess(res, { message: 'Expense updated', data: expense });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.softDeleteExpense(req.params.expenseId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Expense moved to trash', data: result });
});

const restoreExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.restoreExpense(req.params.expenseId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Expense restored', data: result });
});

const getTrash = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getTrashExpenses(req.farmer.farmerId);
  return sendSuccess(res, {
    message: 'Trash fetched',
    data: expenses,
    meta: { count: expenses.length },
  });
});

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, restoreExpense, getTrash };
