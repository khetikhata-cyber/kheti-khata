const Field = require('../models/Field.model');
const Crop = require('../models/Crop.model');
const Expense = require('../models/Expense.model');
const Bataidaar = require('../models/Bataidaar.model');
const Production = require('../models/Production.model');
const Sale = require('../models/Sale.model');
const Loan = require('../models/Loan.model');
const fieldService = require('./field.service');
const cropService = require('./crop.service');
const expenseService = require('./expense.service');
const loanService = require('./loan.service');
const bataidaarService = require('./bataidaar.service');
const productionService = require('./production.service');
const saleService = require('./sale.service');
const AppError = require('../utils/AppError');

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TRASH_PERIOD_MS = 30 * MS_PER_DAY;

const TRASH_CONFIG = {
  field: {
    modalName: 'Field',
    listKey: 'fields',
    restore: (id, farmerId) => fieldService.restoreField(id, farmerId),
  },
  crop: {
    modalName: 'Crop',
    listKey: 'crops',
    restore: (id, farmerId) => cropService.restoreCrop(id, farmerId),
  },
  expense: {
    modalName: 'Expense',
    listKey: 'expenses',
    restore: (id, farmerId) => expenseService.restoreExpense(id, farmerId),
  },
  bataidaar: {
    modalName: 'Bataidaar',
    listKey: 'bataidaars',
    restore: (id, farmerId) => bataidaarService.restoreBataidaar(id, farmerId),
  },
  production: {
    modalName: 'Production',
    listKey: 'productions',
    restore: (id, farmerId) => productionService.restoreProduction(id, farmerId),
  },
  sale: {
    modalName: 'Sale',
    listKey: 'sales',
    restore: (id, farmerId) => saleService.restoreSale(id, farmerId),
  },
  loan: {
    modalName: 'Loan',
    listKey: 'loans',
    restore: (id, farmerId) => loanService.restoreLoan(id, farmerId),
  },
};

/**
 * Calculates how many days remain before a record is permanently purged.
 * MongoDB TTL runs on deletedAt + 30 days.
 */
const daysRemaining = (deletedAt) => {
  const expiresAt = deletedAt + TRASH_PERIOD_MS;
  const remaining = Math.ceil((expiresAt - Date.now()) / MS_PER_DAY);
  return Math.max(0, remaining);
};

const getDirectTrashQuery = (farmerId) => ({
  farmerId,
  deletedAt: { $ne: null },
  deletedParentType: null,
  deletedParentId: null,
});

const addMeta = (records, type) =>
  records.map((r) => ({
    ...r.toObject(),
    modalType: type,
    modalName: TRASH_CONFIG[type].modalName,
    _trashType: type,
    _daysRemaining: daysRemaining(r.deletedAt),
    _expiresAt: r.deletedAt + TRASH_PERIOD_MS,
  }));

/**
 * Get everything in trash for a farmer, grouped by collection type.
 */
const getAllTrash = async (farmerId) => {
  const [fields, crops, expenses, bataidaars, productions, sales, loans] = await Promise.all([
    Field.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Crop.find(getDirectTrashQuery(farmerId)).sort({ deletedAt: -1 }),
    Expense.find(getDirectTrashQuery(farmerId)).sort({ deletedAt: -1 }),
    Bataidaar.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Production.find(getDirectTrashQuery(farmerId)).sort({ deletedAt: -1 }),
    Sale.find(getDirectTrashQuery(farmerId)).sort({ deletedAt: -1 }),
    Loan.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
  ]);

  return {
    fields: addMeta(fields, 'field'),
    crops: addMeta(crops, 'crop'),
    expenses: addMeta(expenses, 'expense'),
    bataidaars: addMeta(bataidaars, 'bataidaar'),
    productions: addMeta(productions, 'production'),
    sales: addMeta(sales, 'sale'),
    loans: addMeta(loans, 'loan'),
    summary: {
      totalItems:
        fields.length +
        crops.length +
        expenses.length +
        bataidaars.length +
        productions.length +
        sales.length +
        loans.length,
      byType: {
        fields: fields.length,
        crops: crops.length,
        expenses: expenses.length,
        bataidaars: bataidaars.length,
        productions: productions.length,
        sales: sales.length,
        loans: loans.length,
      },
    },
  };
};

const restoreTrashItem = async ({ type, id, farmerId }) => {
  console.log('1======>');
  const normalizedModalType = typeof type === 'string' ? type.trim().toLowerCase() : '';
  const restoreConfig = TRASH_CONFIG[normalizedModalType];

  if (!restoreConfig) {
    console.log('restoreConfig', restoreConfig);
    throw new AppError(`Unknown modalType: ${type}`, 400);
  }

  if (!id) {
    console.log('!id', !id);
    throw new AppError('id is required', 400);
  }

  const result = await restoreConfig.restore(id, farmerId);
  console.log('======>');
  return {
    ...result,
    modalType: normalizedModalType,
    modalName: restoreConfig.modalName,
  };
};

module.exports = { getAllTrash, restoreTrashItem };
