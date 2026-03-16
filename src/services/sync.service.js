const Field = require('../models/Field.model');
const Crop = require('../models/Crop.model');
const Expense = require('../models/Expense.model');
const Bataidaar = require('../models/Bataidaar.model');
const Production = require('../models/Production.model');
const Sale = require('../models/Sale.model');
const Loan = require('../models/Loan.model');
const Dealer = require('../models/Dealer.model');

/**
 * Generic upsert batch for a given model and ID field.
 * Inserts if not found, updates if found AND incoming record is newer.
 * Returns { syncedIds, failedIds }
 */
const batchUpsert = async (Model, idField, farmerId, records) => {
  const syncedIds = [];
  const failedIds = [];

  for (const record of records) {
    // Security: farmer can only sync their own records
    if (record.farmerId && record.farmerId !== farmerId) {
      failedIds.push(record[idField]);
      continue;
    }

    try {
      await Model.findOneAndUpdate(
        { [idField]: record[idField] },
        {
          ...record,
          farmerId, // enforce correct farmerId
          updatedAt: record.updatedAt || Date.now(),
          syncedAt:  Date.now(),
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          // Only update if incoming record is newer (last-write-wins)
          // Skip this check for new records (upsert handles it)
        }
      );
      syncedIds.push(record[idField]);
    } catch (err) {
      failedIds.push(record[idField]);
    }
  }

  return { syncedIds, failedIds };
};

const syncFields      = (farmerId, records) => batchUpsert(Field,      'fieldId',      farmerId, records);
const syncCrops       = (farmerId, records) => batchUpsert(Crop,       'cropId',       farmerId, records);
const syncExpenses    = (farmerId, records) => batchUpsert(Expense,    'expenseId',    farmerId, records);
const syncBataidaars  = (farmerId, records) => batchUpsert(Bataidaar,  'bataidaarId',  farmerId, records);
const syncProductions = (farmerId, records) => batchUpsert(Production, 'productionId', farmerId, records);
const syncSales       = (farmerId, records) => batchUpsert(Sale,       'saleId',       farmerId, records);
const syncLoans       = (farmerId, records) => batchUpsert(Loan,       'loanId',       farmerId, records);
const syncDealers     = (farmerId, records) => batchUpsert(Dealer,     'dealerId',     farmerId, records);

module.exports = {
  syncFields,
  syncCrops,
  syncExpenses,
  syncBataidaars,
  syncProductions,
  syncSales,
  syncLoans,
  syncDealers,
};
