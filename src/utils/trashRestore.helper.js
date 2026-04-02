const Field = require('../models/Field.model');
const Crop = require('../models/Crop.model');
const Expense = require('../models/Expense.model');
const Production = require('../models/Production.model');
const Sale = require('../models/Sale.model');
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
    const restore = getRestoreUpdate();
    const cascadedCrops = await Crop.find({
      fieldId,
      farmerId,
      deletedAt: { $ne: null },
      deletedParentType: 'field',
      deletedParentId: fieldId,
    }).select('cropId');
    const cropIds = cascadedCrops.map((crop) => crop.cropId);

    await Promise.all([
      Field.findOneAndUpdate({ fieldId, farmerId }, restore),
      Crop.updateMany(
        {
          cropId: { $in: cropIds },
          farmerId,
          deletedParentType: 'field',
          deletedParentId: fieldId,
        },
        restore
      ),
      Expense.updateMany(
        {
          cropId: { $in: cropIds },
          farmerId,
          deletedParentType: 'field',
          deletedParentId: fieldId,
        },
        restore
      ),
      Production.updateMany(
        {
          cropId: { $in: cropIds },
          farmerId,
          deletedParentType: 'field',
          deletedParentId: fieldId,
        },
        restore
      ),
      Sale.updateMany(
        {
          cropId: { $in: cropIds },
          farmerId,
          deletedParentType: 'field',
          deletedParentId: fieldId,
        },
        restore
      ),
    ]);

    restoredAncestors.push({ type: 'field', id: fieldId });
  }

  return field;
};

const restoreCropIfNeeded = async (cropId, farmerId, restoredAncestors = []) => {
  const crop = await Crop.findOne({ cropId, farmerId });
  if (!crop) throw new AppError('Parent crop not found', 404);

  await restoreFieldIfNeeded(crop.fieldId, farmerId, restoredAncestors);

  if (crop.deletedAt !== null) {
    const restore = getRestoreUpdate();
    await Promise.all([
      Crop.findOneAndUpdate({ cropId, farmerId }, restore),
      Expense.updateMany(
        {
          cropId,
          farmerId,
          deletedParentType: 'crop',
          deletedParentId: cropId,
        },
        restore
      ),
      Production.updateMany(
        {
          cropId,
          farmerId,
          deletedParentType: 'crop',
          deletedParentId: cropId,
        },
        restore
      ),
      Sale.updateMany(
        {
          cropId,
          farmerId,
          deletedParentType: 'crop',
          deletedParentId: cropId,
        },
        restore
      ),
    ]);
    restoredAncestors.push({ type: 'crop', id: cropId });
  }

  return crop;
};

const restoreProductionIfNeeded = async (productionId, farmerId, restoredAncestors = []) => {
  const production = await Production.findOne({ productionId, farmerId });
  if (!production) throw new AppError('Parent production not found', 404);

  await restoreCropIfNeeded(production.cropId, farmerId, restoredAncestors);

  if (production.deletedAt !== null) {
    const restore = getRestoreUpdate();
    await Promise.all([
      Production.findOneAndUpdate({ productionId, farmerId }, restore),
      Sale.updateMany(
        {
          productionId,
          farmerId,
          deletedParentType: 'production',
          deletedParentId: productionId,
        },
        restore
      ),
    ]);
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
