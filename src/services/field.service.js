const Field = require('../models/Field.model');
const Crop = require('../models/Crop.model');
const Expense = require('../models/Expense.model');
const Bataidaar = require('../models/Bataidaar.model');
const Production = require('../models/Production.model');
const Sale = require('../models/Sale.model');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/AppError');

// Conversion rates to acres
const UNIT_TO_ACRES = {
  acre: 1,
  bigha: 0.625,
  guntha: 0.025,
  hectare: 2.471,
};

const convertToAcres = (value, unit) => {
  const rate = UNIT_TO_ACRES[unit];
  if (!rate) throw new AppError(`Unknown area unit: ${unit}`, 400);
  return parseFloat((value * rate).toFixed(4));
};

const getAllFields = async (farmerId) => {
  return Field.find({ farmerId, deletedAt: null }).sort({ createdAt: -1 });
};

const getFieldById = async (fieldId, farmerId) => {
  const field = await Field.findOne({ fieldId, farmerId, deletedAt: null });
  if (!field) throw new AppError('Field not found', 404);
  return field;
};

const createField = async (farmerId, data) => {
  // const areaAcres = convertToAcres(data.areaValue, data.areaUnit);

  const field = await Field.create({
    fieldId: uuidv4(),
    farmerId,
    name: data.name,
    areaAcres: data.areaAcres, // using areaAcres directly from request body since conversion is handled in controller validation
    khasraNumber: data.khasraNumber || null,
  });

  return field;
};

const updateField = async (fieldId, farmerId, data) => {
  const field = await Field.findOne({ fieldId, farmerId, deletedAt: null });
  if (!field) throw new AppError('Field not found', 404);

  if (data.areaValue && data.areaUnit) {
    data.areaAcres = convertToAcres(data.areaValue, data.areaUnit);
  }

  const updated = await Field.findOneAndUpdate(
    { fieldId, farmerId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  return updated;
};

/**
 * Soft delete field + cascade to all crops, expenses, bataidaars, productions, sales
 */
const softDeleteField = async (fieldId, farmerId) => {
  const field = await Field.findOne({ fieldId, farmerId, deletedAt: null });
  if (!field) throw new AppError('Field not found', 404);

  const now = Date.now();

  // 1. soft delete field
  await Field.findOneAndUpdate({ fieldId }, { deletedAt: now, deletedBy: farmerId });

  // 2. find all crops under field
  const crops = await Crop.find({ fieldId, farmerId, deletedAt: null }).select('cropId');
  const cropIds = crops.map((c) => c.cropId);

  if (cropIds.length > 0) {
    const ts = { deletedAt: now, deletedBy: farmerId };

    // 3. cascade soft delete
    await Promise.all([
      Crop.updateMany({ cropId: { $in: cropIds } }, ts),
      Expense.updateMany({ cropId: { $in: cropIds } }, ts),
      Bataidaar.updateMany({ cropId: { $in: cropIds } }, ts),
      Production.updateMany({ cropId: { $in: cropIds } }, ts),
      Sale.updateMany({ cropId: { $in: cropIds } }, ts),
    ]);
  }

  return { deleted: true, cascadedCrops: cropIds.length };
};

/**
 * Restore soft-deleted field + all children
 */
const restoreField = async (fieldId, farmerId) => {
  const field = await Field.findOne({ fieldId, farmerId, deletedAt: { $ne: null } });
  if (!field) throw new AppError('Field not found in trash', 404);

  const restore = { deletedAt: null, deletedBy: null };

  const crops = await Crop.find({ fieldId, farmerId, deletedAt: { $ne: null } }).select('cropId');
  const cropIds = crops.map((c) => c.cropId);

  await Promise.all([
    Field.findOneAndUpdate({ fieldId }, restore),
    Crop.updateMany({ cropId: { $in: cropIds } }, restore),
    Expense.updateMany({ cropId: { $in: cropIds } }, restore),
    Bataidaar.updateMany({ cropId: { $in: cropIds } }, restore),
    Production.updateMany({ cropId: { $in: cropIds } }, restore),
    Sale.updateMany({ cropId: { $in: cropIds } }, restore),
  ]);

  return { restored: true };
};

const getFieldsWithActiveCrop = async (farmerId) => {
  console.log('inside getFieldsWithActiveCrop for farmerId', farmerId);
  const fields = await Field.find({ farmerId, deletedAt: null }).sort({ createdAt: -1 }).lean();

  console.log('fields fetched for farmerId', fields);

  // For each field, fetch its active crop
  const fieldsWithCrops = await Promise.all(
    fields.map(async (field) => {
      const activeCrop = await Crop.findOne({
        fieldId: field.fieldId,
        farmerId,
        status: 'active', // only active crops
        deletedAt: null,
      })
        .select('cropId name variety sowingDate expectedDays status')
        .lean();

      return { ...field, activeCrop: activeCrop || null };
    })
  );

  console.log('Fields with active crops:', fieldsWithCrops);

  return fieldsWithCrops;
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  softDeleteField,
  restoreField,
  getFieldsWithActiveCrop,
};
