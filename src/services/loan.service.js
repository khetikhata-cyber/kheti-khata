const Loan = require('../models/Loan.model');
const AppError = require('../utils/AppError');

const getAllLoans = async (farmerId, status = null) => {
  const query = { farmerId, deletedAt: null };
  if (status) query.status = status;
  return Loan.find(query).sort({ createdAt: -1 });
};

const getLoanById = async (loanId, farmerId) => {
  const loan = await Loan.findOne({ loanId, farmerId, deletedAt: null });
  if (!loan) throw new AppError('Loan not found', 404);
  return loan;
};

const createLoan = async (farmerId, data) => {
  const loan = await Loan.create({
    ...data,
    farmerId,
    balance: data.amount - (data.repaidAmount || 0),
  });
  return loan;
};

const updateLoan = async (loanId, farmerId, data) => {
  const loan = await Loan.findOne({ loanId, farmerId, deletedAt: null });
  if (!loan) throw new AppError('Loan not found', 404);

  // Recalculate balance if amount or repaid changes
  if (data.repaidAmount !== undefined || data.amount !== undefined) {
    const amount = data.amount ?? loan.amount;
    const repaid = data.repaidAmount ?? loan.repaidAmount;
    data.balance = amount - repaid;
    data.status = data.balance <= 0 ? 'closed' : loan.status;
  }

  return Loan.findOneAndUpdate(
    { loanId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
};

const softDeleteLoan = async (loanId, farmerId) => {
  const loan = await Loan.findOne({ loanId, farmerId, deletedAt: null });
  if (!loan) throw new AppError('Loan not found', 404);
  await Loan.findOneAndUpdate({ loanId }, { deletedAt: Date.now(), deletedBy: farmerId });
  return { deleted: true };
};

const restoreLoan = async (loanId, farmerId) => {
  const loan = await Loan.findOne({ loanId, farmerId, deletedAt: { $ne: null } });
  if (!loan) throw new AppError('Loan not found in trash', 404);
  await Loan.findOneAndUpdate({ loanId }, { deletedAt: null, deletedBy: null });
  return { restored: true };
};

module.exports = { getAllLoans, getLoanById, createLoan, updateLoan, softDeleteLoan, restoreLoan };
