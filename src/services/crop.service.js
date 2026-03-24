const Crop = require('../models/Crop.model');
const Expense = require('../models/Expense.model');
const Bataidaar = require('../models/Bataidaar.model');
const Production = require('../models/Production.model');
const Sale = require('../models/Sale.model');
const Field = require('../models/Field.model');
const AppError = require('../utils/AppError');

const getCropsByField = async (fieldId, farmerId) => {
  // verify field belongs to farmer
  const field = await Field.findOne({ fieldId, farmerId, deletedAt: null });
  if (!field) throw new AppError('Field not found', 404);

  return Crop.find({ fieldId, farmerId, deletedAt: null }).sort({ createdAt: -1 });
};

const getCropById = async (cropId, farmerId) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);
  return crop;
};

const createCrop = async (farmerId, data) => {
  // verify field exists and belongs to farmer
  console.log('Creating crop with data:', data);
  const field = await Field.findOne({ fieldId: data.fieldId, farmerId, deletedAt: null });
  if (!field) throw new AppError('Field not found', 404);

  const crop = await Crop.create({ ...data, farmerId });
  return crop;
};

const updateCrop = async (cropId, farmerId, data) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  const updated = await Crop.findOneAndUpdate(
    { cropId, farmerId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  return updated;
};

/**
 * Soft delete crop + cascade to all children
 */
const softDeleteCrop = async (cropId, farmerId) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  const now = Date.now();
  const ts = { deletedAt: now, deletedBy: farmerId };

  await Promise.all([
    Crop.findOneAndUpdate({ cropId }, ts),
    Expense.updateMany({ cropId }, ts),
    Bataidaar.updateMany({ cropId }, ts),
    Production.updateMany({ cropId }, ts),
    Sale.updateMany({ cropId }, ts),
  ]);

  return { deleted: true };
};

/**
 * Restore crop + all its children
 */
const restoreCrop = async (cropId, farmerId) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: { $ne: null } });
  if (!crop) throw new AppError('Crop not found in trash', 404);

  const restore = { deletedAt: null, deletedBy: null };

  await Promise.all([
    Crop.findOneAndUpdate({ cropId }, restore),
    Expense.updateMany({ cropId }, restore),
    Bataidaar.updateMany({ cropId }, restore),
    Production.updateMany({ cropId }, restore),
    Sale.updateMany({ cropId }, restore),
  ]);

  return { restored: true };
};

/**
 * Add a photo to the crop diary (max 30)
 */
const addCropPhoto = async (cropId, farmerId, { url, takenAt }) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);
  if (crop.cropPhotos.length >= 30) throw new AppError('Maximum 30 photos allowed per crop', 400);

  const updated = await Crop.findOneAndUpdate(
    { cropId },
    { $push: { cropPhotos: { url, takenAt: takenAt || Date.now() } }, updatedAt: Date.now() },
    { new: true }
  );
  return updated;
};

/**
 * Delete a photo from the crop diary by URL
 */
const deleteCropPhoto = async (cropId, farmerId, photoUrl) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  const updated = await Crop.findOneAndUpdate(
    { cropId },
    { $pull: { cropPhotos: { url: photoUrl } }, updatedAt: Date.now() },
    { new: true }
  );
  return updated;
};

module.exports = {
  getCropsByField,
  getCropById,
  createCrop,
  updateCrop,
  softDeleteCrop,
  restoreCrop,
  addCropPhoto,
  deleteCropPhoto,
};
