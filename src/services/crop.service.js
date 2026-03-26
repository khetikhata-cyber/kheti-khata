const Crop = require('../models/Crop.model');
const Expense = require('../models/Expense.model');
const Bataidaar = require('../models/Bataidaar.model');
const Production = require('../models/Production.model');
const Sale = require('../models/Sale.model');
const Field = require('../models/Field.model');
const AppError = require('../utils/AppError');

const parseCropDate = (value) => {
  if (!value || typeof value !== 'string') return null;

  const [day, month, year] = value.split('/');
  if (!day || !month || !year) return null;

  const parsedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const getCropsByField = async (fieldId, farmerId) => {
  // verify field belongs to farmer
  console.log(`Fetching crops for fieldId: ${fieldId}, farmerId: ${farmerId}`);
  const field = await Field.findOne({ fieldId, farmerId, deletedAt: null });
  if (!field) throw new AppError('Field not found', 404);

  return Crop.find({ fieldId, farmerId, deletedAt: null }).sort({ createdAt: -1 });
};

const getCropById = async (cropId, farmerId) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);
  return crop;
};

const filterCompletedCropsByDateRange = async (farmerId, { fromDate, toDate }) => {
  const from = parseCropDate(fromDate);
  const to = parseCropDate(toDate);

  if (!from || !to) {
    throw new AppError('Invalid date format. Use DD/MM/YYYY', 400);
  }

  if (from > to) {
    throw new AppError('fromDate cannot be greater than toDate', 400);
  }

  const crops = await Crop.find({
    farmerId,
    status: 'completed',
    deletedAt: null,
  })
    .populate('fieldRefId')
    .sort({ sowingDate: -1, createdAt: -1 });

  return crops.filter((crop) => {
    const cropDate = parseCropDate(crop.sowingDate);
    return cropDate && cropDate >= from && cropDate <= to;
  });
};

const createCrop = async (farmerId, data) => {
  // verify field exists and belongs to farmer
  console.log('Creating crop with data:', data);
  const field = await Field.findOne({ fieldId: data.fieldId, farmerId, deletedAt: null });
  if (!field) throw new AppError('Field not found', 404);

  const bataidaarId = data.bataidaarId;

  if (data.hasBataidaar === true && !bataidaarId) {
    throw new AppError('bataidaarId is required when hasBataidaar is true', 400);
  }

  const bataidaarMongoObj = await Bataidaar.findOne({
    bataidaarId: data.bataidaarId,
    farmerId,
    deletedAt: null,
  });

  const fieldMongoObj = await Field.findOne({
    fieldId: data.fieldId,
    deletedAt: null,
  });

  const crop = await Crop.create({
    ...data,
    farmerId,
    fieldRefId: fieldMongoObj._id,
    totalExpenses: 0,
    salePrice: 0,
    hasBataidaar: Boolean(bataidaarId),
    bataidaarId: bataidaarId ? bataidaarId : null,
  });

  if (bataidaarId) {
    await Bataidaar.findByIdAndUpdate(bataidaarMongoObj._id, {
      $addToSet: { linkedCropIds: crop._id },
      $set: { updatedAt: Date.now() },
    });
  }

  return crop;
};

const updateCrop = async (cropId, farmerId, data) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  const bataidaarId = data.bataidaarId;
  if (data.hasBataidaar === true && !bataidaarId) {
    throw new AppError('bataidaarId is required when hasBataidaar is true', 400);
  }

  const updated = await Crop.findOneAndUpdate(
    { cropId, farmerId },
    {
      ...data,
      ...(data.salePrice !== undefined ? { salePrice: Number(data.salePrice) || 0 } : {}),
      hasBataidaar: Boolean(bataidaarId),
      bataidaarId: bataidaarId || null,
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true }
  );

  // const previousBataidaarId = crop.bataidaarId ? String(crop.bataidaarId) : null;
  // const currentBataidaarId = nextBataidaar ? String(nextBataidaar._id) : null;

  // if (previousBataidaarId && previousBataidaarId !== currentBataidaarId) {
  //   await Bataidaar.findByIdAndUpdate(crop.bataidaarId, {
  //     $pull: { linkedCropIds: crop._id },
  //     $set: { updatedAt: Date.now() },
  //   });
  // }

  // if (currentBataidaarId && previousBataidaarId !== currentBataidaarId) {
  //   await Bataidaar.findByIdAndUpdate(nextBataidaar._id, {
  //     $addToSet: { linkedCropIds: crop._id },
  //     $set: { updatedAt: Date.now() },
  //   });
  // }

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
  filterCompletedCropsByDateRange,
  createCrop,
  updateCrop,
  softDeleteCrop,
  restoreCrop,
  addCropPhoto,
  deleteCropPhoto,
};
