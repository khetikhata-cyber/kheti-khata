const saleService = require('../services/sale.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getSalesByProduction = asyncHandler(async (req, res) => {
  const sales = await saleService.getSalesByProduction(
    req.params.productionId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Sales fetched', data: sales, meta: { count: sales.length } });
});

const getSalesByCrop = asyncHandler(async (req, res) => {
  const sales = await saleService.getSalesByCrop(req.params.cropId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Sales fetched', data: sales, meta: { count: sales.length } });
});

const createSale = asyncHandler(async (req, res) => {
  const sale = await saleService.createSale(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Sale recorded successfully', data: sale });
});

const updateSale = asyncHandler(async (req, res) => {
  const sale = await saleService.updateSale(req.params.saleId, req.farmer.farmerId, req.body);
  return sendSuccess(res, { message: 'Sale updated', data: sale });
});

const deleteSale = asyncHandler(async (req, res) => {
  const result = await saleService.softDeleteSale(req.params.saleId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Sale moved to trash', data: result });
});

const restoreSale = asyncHandler(async (req, res) => {
  const result = await saleService.restoreSale(req.params.saleId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Sale restored', data: result });
});

module.exports = { getSalesByProduction, getSalesByCrop, createSale, updateSale, deleteSale, restoreSale };
