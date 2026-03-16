const Bataidaar = require('../models/Bataidaar.model');
const Crop = require('../models/Crop.model');
const AppError = require('../utils/AppError');

const getBataidaarByCrop = async (cropId, farmerId) => {
  const bataidaar = await Bataidaar.findOne({ cropId, farmerId, deletedAt: null });
  if (!bataidaar) throw new AppError('No bataidaar found for this crop', 404);
  return bataidaar;
};

const createBataidaar = async (farmerId, data) => {
  // Verify crop belongs to this farmer
  const crop = await Crop.findOne({ cropId: data.cropId, farmerId, deletedAt: null });
  if (!crop) throw new AppError('Crop not found', 404);

  // Prevent duplicate bataidaar for same crop
  const existing = await Bataidaar.findOne({ cropId: data.cropId, deletedAt: null });
  if (existing) throw new AppError('A bataidaar already exists for this crop', 409);

  const bataidaar = await Bataidaar.create({ ...data, farmerId });

  // Update crop: set hasBataidaar=true and link bataidaarId
  await Crop.findOneAndUpdate(
    { cropId: data.cropId },
    { hasBataidaar: true, bataidaarId: bataidaar.bataidaarId, updatedAt: Date.now() }
  );

  return bataidaar;
};

const updateBataidaar = async (bataidaarId, farmerId, data) => {
  const bataidaar = await Bataidaar.findOne({ bataidaarId, farmerId, deletedAt: null });
  if (!bataidaar) throw new AppError('Bataidaar not found', 404);

  return Bataidaar.findOneAndUpdate(
    { bataidaarId },
    { ...data, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
};

const softDeleteBataidaar = async (bataidaarId, farmerId) => {
  const bataidaar = await Bataidaar.findOne({ bataidaarId, farmerId, deletedAt: null });
  if (!bataidaar) throw new AppError('Bataidaar not found', 404);

  await Bataidaar.findOneAndUpdate(
    { bataidaarId },
    { deletedAt: Date.now(), deletedBy: farmerId }
  );

  // Unlink from crop
  await Crop.findOneAndUpdate(
    { cropId: bataidaar.cropId },
    { hasBataidaar: false, bataidaarId: null, updatedAt: Date.now() }
  );

  return { deleted: true };
};

const restoreBataidaar = async (bataidaarId, farmerId) => {
  const bataidaar = await Bataidaar.findOne({ bataidaarId, farmerId, deletedAt: { $ne: null } });
  if (!bataidaar) throw new AppError('Bataidaar not found in trash', 404);

  await Bataidaar.findOneAndUpdate({ bataidaarId }, { deletedAt: null, deletedBy: null });

  // Re-link to crop
  await Crop.findOneAndUpdate(
    { cropId: bataidaar.cropId },
    { hasBataidaar: true, bataidaarId, updatedAt: Date.now() }
  );

  return { restored: true };
};

module.exports = {
  getBataidaarByCrop,
  createBataidaar,
  updateBataidaar,
  softDeleteBataidaar,
  restoreBataidaar,
};
