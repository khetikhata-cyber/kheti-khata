const productionService = require('../services/production.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getProduction = asyncHandler(async (req, res) => {
  const production = await productionService.getProductionByCrop(
    req.params.cropId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Production record fetched', data: production });
});

const createProduction = asyncHandler(async (req, res) => {
  const production = await productionService.createProduction(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Harvest recorded successfully', data: production });
});

const updateProduction = asyncHandler(async (req, res) => {
  const production = await productionService.updateProduction(
    req.params.productionId,
    req.farmer.farmerId,
    req.body
  );
  return sendSuccess(res, { message: 'Production record updated', data: production });
});

const deleteProduction = asyncHandler(async (req, res) => {
  const result = await productionService.softDeleteProduction(
    req.params.productionId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Production record moved to trash', data: result });
});

const restoreProduction = asyncHandler(async (req, res) => {
  const result = await productionService.restoreProduction(
    req.params.productionId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Production record restored', data: result });
});

module.exports = { getProduction, createProduction, updateProduction, deleteProduction, restoreProduction };
