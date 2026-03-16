const settlementService = require('../services/settlement.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

// Preview settlement before finalizing (settlement screen in app)
const previewSettlement = asyncHandler(async (req, res) => {
  const result = await settlementService.previewSettlement(
    req.params.cropId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Settlement preview calculated', data: result });
});

// Finalize and save settlement snapshot
const finalizeSettlement = asyncHandler(async (req, res) => {
  const settlement = await settlementService.finalizeSettlement(
    req.params.cropId,
    req.farmer.farmerId,
    req.body.pdfUrl || null
  );
  return sendCreated(res, { message: 'Settlement finalized successfully', data: settlement });
});

// Get saved settlement for a crop
const getSettlement = asyncHandler(async (req, res) => {
  const settlement = await settlementService.getSettlementByCrop(
    req.params.cropId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Settlement fetched', data: settlement });
});

// Get all settlements (yearly summary)
const getAllSettlements = asyncHandler(async (req, res) => {
  const settlements = await settlementService.getAllSettlements(req.farmer.farmerId);
  return sendSuccess(res, {
    message: 'Settlements fetched',
    data: settlements,
    meta: { count: settlements.length },
  });
});

module.exports = { previewSettlement, finalizeSettlement, getSettlement, getAllSettlements };
