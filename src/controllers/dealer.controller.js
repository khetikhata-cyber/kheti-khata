const dealerService = require('../services/dealer.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getAllDealers = asyncHandler(async (req, res) => {
  const dealers = await dealerService.getAllDealers(req.farmer.farmerId);
  return sendSuccess(res, { message: 'Dealers fetched', data: dealers, meta: { count: dealers.length } });
});

const getDealer = asyncHandler(async (req, res) => {
  const dealer = await dealerService.getDealerById(req.params.dealerId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Dealer fetched', data: dealer });
});

const getDealerLedger = asyncHandler(async (req, res) => {
  const result = await dealerService.getDealerLedger(req.params.dealerId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Dealer ledger fetched', data: result });
});

const createDealer = asyncHandler(async (req, res) => {
  const dealer = await dealerService.createDealer(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Dealer added', data: dealer });
});

const updateDealer = asyncHandler(async (req, res) => {
  const dealer = await dealerService.updateDealer(req.params.dealerId, req.farmer.farmerId, req.body);
  return sendSuccess(res, { message: 'Dealer updated', data: dealer });
});

const markPayment = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const dealer = await dealerService.markPayment(req.params.dealerId, req.farmer.farmerId, amount);
  return sendSuccess(res, { message: 'Payment marked successfully', data: dealer });
});

const deleteDealer = asyncHandler(async (req, res) => {
  const result = await dealerService.deleteDealer(req.params.dealerId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Dealer deleted', data: result });
});

module.exports = { getAllDealers, getDealer, getDealerLedger, createDealer, updateDealer, markPayment, deleteDealer };
