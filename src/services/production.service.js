const Production = require('../models/Production.model');
const Sale = require('../models/Sale.model');
const Crop = require('../models/Crop.model');
const AppError = require('../utils/AppError');

const getProductionByCrop = async (cropId, farmerId) => {
  const production = await Production.findOne({ cropId, farmerId, deletedAt: null });
  if (!production) throw new AppError('No production record found for this crop', 404);
  return production;
};

const createProduction = async (farmerId, data) => {
  // Verify crop belongs to farmer
  const crop = await Crop.findOne({ cropId: data.cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  // Prevent duplicate production record per crop
  const existing = await Production.findOne({ cropId: data.cropId, deletedAt: null });
  if (existing) throw new AppError('Production record already exists for this crop', 409);

  const production = await Production.create({
    ...data,
    farmerId,
    unsoldBalance: data.totalQuantity, // starts fully unsold
  });

  // Mark crop as harvested
  await Crop.findOneAndUpdate(
    { cropId: data.cropId },
    { status: 'harvested', updatedAt: Date.now() }
  );

  return production;
};

const updateProduction = async (productionId, farmerId, data) => {
  const production = await Production.findOne({ productionId, farmerId, deletedAt: null });
  if (!production) throw new AppError('Production record not found', 404);

  // Recalculate unsold balance if total quantity changes
  if (data.totalQuantity !== undefined) {
    const totalSold = await Sale.aggregate([
      { $match: { productionId, deletedAt: null } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const sold = totalSold[0]?.total || 0;
    data.unsoldBalance = Math.max(0, data.totalQuantity - sold);
  }

  return Production.findOneAndUpdate(
    { productionId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
};

const softDeleteProduction = async (productionId, farmerId) => {
  const production = await Production.findOne({ productionId, farmerId, deletedAt: null });
  if (!production) throw new AppError('Production record not found', 404);

  const now = Date.now();
  await Promise.all([
    Production.findOneAndUpdate({ productionId }, { deletedAt: now, deletedBy: farmerId }),
    Sale.updateMany({ productionId }, { deletedAt: now, deletedBy: farmerId }),
  ]);

  return { deleted: true };
};

const restoreProduction = async (productionId, farmerId) => {
  const production = await Production.findOne({ productionId, farmerId, deletedAt: { $ne: null } });
  if (!production) throw new AppError('Production record not found in trash', 404);

  const restore = { deletedAt: null, deletedBy: null };
  await Promise.all([
    Production.findOneAndUpdate({ productionId }, restore),
    Sale.updateMany({ productionId }, restore),
  ]);

  return { restored: true };
};

module.exports = {
  getProductionByCrop,
  createProduction,
  updateProduction,
  softDeleteProduction,
  restoreProduction,
};
