const loanService = require('../services/loan.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getAllLoans = asyncHandler(async (req, res) => {
  const loans = await loanService.getAllLoans(req.farmer.farmerId, req.query.status);
  return sendSuccess(res, { message: 'Loans fetched', data: loans, meta: { count: loans.length } });
});

const getLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.getLoanById(req.params.loanId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Loan fetched', data: loan });
});

const createLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.createLoan(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Loan added successfully', data: loan });
});

const updateLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.updateLoan(req.params.loanId, req.farmer.farmerId, req.body);
  return sendSuccess(res, { message: 'Loan updated', data: loan });
});

const deleteLoan = asyncHandler(async (req, res) => {
  const result = await loanService.softDeleteLoan(req.params.loanId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Loan moved to trash', data: result });
});

const restoreLoan = asyncHandler(async (req, res) => {
  const result = await loanService.restoreLoan(req.params.loanId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Loan restored', data: result });
});

module.exports = { getAllLoans, getLoan, createLoan, updateLoan, deleteLoan, restoreLoan };
