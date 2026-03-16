const syncService = require('../services/sync.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const makeSync = (serviceFn) =>
  asyncHandler(async (req, res) => {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return sendSuccess(res, {
        message: 'No records to sync',
        data: { syncedIds: [], failedIds: [] },
      });
    }

    const result = await serviceFn(req.farmer.farmerId, records);

    return sendSuccess(res, {
      message: `Synced ${result.syncedIds.length} records`,
      data: result,
    });
  });

module.exports = {
  syncFields:      makeSync(syncService.syncFields),
  syncCrops:       makeSync(syncService.syncCrops),
  syncExpenses:    makeSync(syncService.syncExpenses),
  syncBataidaars:  makeSync(syncService.syncBataidaars),
  syncProductions: makeSync(syncService.syncProductions),
  syncSales:       makeSync(syncService.syncSales),
  syncLoans:       makeSync(syncService.syncLoans),
  syncDealers:     makeSync(syncService.syncDealers),
};
