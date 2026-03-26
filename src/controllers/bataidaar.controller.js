const bataidaarService = require('../services/bataidaar.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getAllBataidaars = asyncHandler(async (req, res) => {
  const bataidaars = await bataidaarService.getAllBataidaars(req.farmer.farmerId);
  return sendSuccess(res, {
    message: 'Bataidaars fetched',
    data: bataidaars,
    meta: { count: bataidaars.length },
  });
});

const getBataidaarById = asyncHandler(async (req, res) => {
  const bataidaar = await bataidaarService.getBataidaarById(
    req.params.bataidaarId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Bataidaar fetched', data: bataidaar });
});

const getBataidaarByCrop = asyncHandler(async (req, res) => {
  const bataidaar = await bataidaarService.getBataidaarByCrop(
    req.params.cropId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Bataidaar fetched', data: bataidaar });
});

const createBataidaar = asyncHandler(async (req, res) => {
  const bataidaar = await bataidaarService.createBataidaar(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Bataidaar added successfully', data: bataidaar });
});

const updateBataidaar = asyncHandler(async (req, res) => {
  const bataidaar = await bataidaarService.updateBataidaar(
    req.params.bataidaarId,
    req.farmer.farmerId,
    req.body
  );
  return sendSuccess(res, { message: 'Bataidaar updated', data: bataidaar });
});

const deleteBataidaar = asyncHandler(async (req, res) => {
  const result = await bataidaarService.softDeleteBataidaar(
    req.params.bataidaarId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Bataidaar moved to trash', data: result });
});

const restoreBataidaar = asyncHandler(async (req, res) => {
  const result = await bataidaarService.restoreBataidaar(
    req.params.bataidaarId,
    req.farmer.farmerId
  );
  return sendSuccess(res, { message: 'Bataidaar restored', data: result });
});

module.exports = {
  getAllBataidaars,
  getBataidaarById,
  getBataidaarByCrop,
  createBataidaar,
  updateBataidaar,
  deleteBataidaar,
  restoreBataidaar,
};
