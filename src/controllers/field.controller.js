const fieldService = require('../services/field.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const getAllFields = asyncHandler(async (req, res) => {
  const fields = await fieldService.getAllFields(req.farmer.farmerId);
  return sendSuccess(res, {
    message: 'Fields fetched',
    data: fields,
    meta: { count: fields.length },
  });
});

const getField = asyncHandler(async (req, res) => {
  const field = await fieldService.getFieldById(req.params.fieldId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Field fetched', data: field });
});

const createField = asyncHandler(async (req, res) => {
  const field = await fieldService.createField(req.farmer.farmerId, req.body);
  return sendCreated(res, { message: 'Field created successfully', data: field });
});

const updateField = asyncHandler(async (req, res) => {
  const field = await fieldService.updateField(req.params.fieldId, req.farmer.farmerId, req.body);
  return sendSuccess(res, { message: 'Field updated successfully', data: field });
});

const deleteField = asyncHandler(async (req, res) => {
  const result = await fieldService.softDeleteField(req.params.fieldId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Field moved to trash', data: result });
});

const restoreField = asyncHandler(async (req, res) => {
  const result = await fieldService.restoreField(req.params.fieldId, req.farmer.farmerId);
  return sendSuccess(res, { message: 'Field restored successfully', data: result });
});

module.exports = { getAllFields, getField, createField, updateField, deleteField, restoreField };
