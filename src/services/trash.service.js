const Field      = require('../models/Field.model');
const Crop       = require('../models/Crop.model');
const Expense    = require('../models/Expense.model');
const Bataidaar  = require('../models/Bataidaar.model');
const Production = require('../models/Production.model');
const Sale       = require('../models/Sale.model');
const Loan       = require('../models/Loan.model');

const MS_PER_DAY      = 24 * 60 * 60 * 1000;
const TRASH_PERIOD_MS = 30 * MS_PER_DAY;

/**
 * Calculates how many days remain before a record is permanently purged.
 * MongoDB TTL runs on deletedAt + 30 days.
 */
const daysRemaining = (deletedAt) => {
  const expiresAt = deletedAt + TRASH_PERIOD_MS;
  const remaining = Math.ceil((expiresAt - Date.now()) / MS_PER_DAY);
  return Math.max(0, remaining);
};

const addMeta = (records, type) =>
  records.map((r) => ({
    ...r.toObject(),
    _trashType:      type,
    _daysRemaining:  daysRemaining(r.deletedAt),
    _expiresAt:      r.deletedAt + TRASH_PERIOD_MS,
  }));

/**
 * Get everything in trash for a farmer, grouped by collection type.
 */
const getAllTrash = async (farmerId) => {
  const [fields, crops, expenses, bataidaars, productions, sales, loans] = await Promise.all([
    Field.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Crop.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Expense.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Bataidaar.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Production.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Sale.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
    Loan.find({ farmerId, deletedAt: { $ne: null } }).sort({ deletedAt: -1 }),
  ]);

  return {
    fields:      addMeta(fields,      'field'),
    crops:       addMeta(crops,       'crop'),
    expenses:    addMeta(expenses,    'expense'),
    bataidaars:  addMeta(bataidaars,  'bataidaar'),
    productions: addMeta(productions, 'production'),
    sales:       addMeta(sales,       'sale'),
    loans:       addMeta(loans,       'loan'),
    summary: {
      totalItems:
        fields.length + crops.length + expenses.length +
        bataidaars.length + productions.length + sales.length + loans.length,
      byType: {
        fields:      fields.length,
        crops:       crops.length,
        expenses:    expenses.length,
        bataidaars:  bataidaars.length,
        productions: productions.length,
        sales:       sales.length,
        loans:       loans.length,
      },
    },
  };
};

module.exports = { getAllTrash };
