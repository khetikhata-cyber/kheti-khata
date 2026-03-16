const cropService = require('../services/crop.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getCropsByField = asyncHandler(async (req, res) => {
  const crops = await cropService.getCropsByField(req.params.fieldId, req.farmer.farmerId);
  return sendSuccess(res, {
    message: 'Crops fetched',
    data: crops,
    meta: { count: crops.length },
  });
});

const getCrop = asyncHandler(async (req, res) => {
  const crop = await cropService.getCropById(req.params.cropId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Crop fetched', data: crop });
});

const createCrop = asyncHandler(async (req, res) => {
  const crop = await cropService.createCrop(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Crop created successfully', data: crop });
});

const updateCrop = asyncHandler(async (req, res) => {
  const crop = await cropService.updateCrop(req.params.cropId, req.farmer.farmerId, req.body);
  return sendSuccess(res, { message: 'Crop updated successfully', data: crop });
});

const deleteCrop = asyncHandler(async (req, res) => {
  const result = await cropService.softDeleteCrop(req.params.cropId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Crop moved to trash', data: result });
});

const restoreCrop = asyncHandler(async (req, res) => {
  const result = await cropService.restoreCrop(req.params.cropId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Crop restored successfully', data: result });
});

const addPhoto = asyncHandler(async (req, res) => {
  const crop = await cropService.addCropPhoto(req.params.cropId, req.farmer.farmerId, req.body);
  return sendSuccess(res, { message: 'Photo added to crop diary', data: crop });
});

const deletePhoto = asyncHandler(async (req, res) => {
  const crop = await cropService.deleteCropPhoto(
    req.params.cropId,
    req.farmer.farmerId,
    req.body.photoUrl
  );
  return sendSuccess(res, { message: 'Photo removed from crop diary', data: crop });
});

module.exports = {
  getCropsByField,
  getCrop,
  createCrop,
  updateCrop,
  deleteCrop,
  restoreCrop,
  addPhoto,
  deletePhoto,
};
