const Field = require('../models/Field.model');
const Crop = require('../models/Crop.model');
const Production = require('../models/Production.model');
const AppError = require('./AppError');

const getRestoreUpdate = () => ({
  deletedAt: null,
  deletedBy: null,
  deletedParentType: null,
  deletedParentId: null,
});

const getSoftDeleteUpdate = ({ farmerId, deletedAt, parentType = null, parentId = null }) => ({
  deletedAt,
  deletedBy: farmerId,
  deletedParentType: parentType,
  deletedParentId: parentId,
});

const restoreFieldIfNeeded = async (fieldId, farmerId, restoredAncestors = []) => {
  const field = await Field.findOne({ fieldId, farmerId });
  if (!field) throw new AppError('Parent field not found', 404);

  if (field.deletedAt !== null) {
    await Field.findOneAndUpdate({ fieldId, farmerId }, getRestoreUpdate());
    restoredAncestors.push({ type: 'field', id: fieldId });
  }

  return field;
};

const restoreCropIfNeeded = async (cropId, farmerId, restoredAncestors = []) => {
  const crop = await Crop.findOne({ cropId, farmerId });
  if (!crop) throw new AppError('Parent crop not found', 404);

  await restoreFieldIfNeeded(crop.fieldId, farmerId, restoredAncestors);

  if (crop.deletedAt !== null) {
    await Crop.findOneAndUpdate({ cropId, farmerId }, getRestoreUpdate());
    restoredAncestors.push({ type: 'crop', id: cropId });
  }

  return crop;
};

const restoreProductionIfNeeded = async (productionId, farmerId, restoredAncestors = []) => {
  const production = await Production.findOne({ productionId, farmerId });
  if (!production) throw new AppError('Parent production not found', 404);

  await restoreCropIfNeeded(production.cropId, farmerId, restoredAncestors);

  if (production.deletedAt !== null) {
    await Production.findOneAndUpdate({ productionId, farmerId }, getRestoreUpdate());
    restoredAncestors.push({ type: 'production', id: productionId });
  }

  return production;
};

module.exports = {
  getRestoreUpdate,
  getSoftDeleteUpdate,
  restoreFieldIfNeeded,
  restoreCropIfNeeded,
  restoreProductionIfNeeded,
};
