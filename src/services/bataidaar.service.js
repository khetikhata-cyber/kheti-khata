const Bataidaar = require('../models/Bataidaar.model');
const Crop = require('../models/Crop.model');
const AppError = require('../utils/AppError');

const getAllBataidaars = async (farmerId) => {
  return Bataidaar.find({ farmerId, deletedAt: null }).sort({ createdAt: -1 });
};

const getBataidaarById = async (bataidaarId, farmerId) => {
  const bataidaar = await Bataidaar.findOne({ bataidaarId, farmerId, deletedAt: null }).populate({
    path: 'linkedCropIds',
    match: { deletedAt: null },
    populate: {
      path: 'fieldRefId',
    },
  });

  if (!bataidaar) throw new AppError('Bataidaar not found', 404);
  return bataidaar;
};

const getBataidaarByCrop = async (cropId, farmerId) => {
  const crop = await Crop.findOne({ cropId, farmerId, deletedAt: null }).select('bataidaarId');
  if (!crop) throw new AppError('Crop not found', 404);
  if (!crop.bataidaarId) throw new AppError('No bataidaar found for this crop', 404);

  const bataidaar = await Bataidaar.findOne({
    _id: crop.bataidaarId,
    farmerId,
    deletedAt: null,
  });
  if (!bataidaar) throw new AppError('No bataidaar found for this crop', 404);
  return bataidaar;
};

const createBataidaar = async (farmerId, data) => {
  return Bataidaar.create({
    ...data,
    farmerId,
    linkedCropIds: Array.isArray(data.linkedCropIds) ? data.linkedCropIds : [],
  });
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

  await Bataidaar.findOneAndUpdate({ bataidaarId }, { deletedAt: Date.now(), deletedBy: farmerId });

  // await Crop.updateMany(
  //   { farmerId, bataidaarId: bataidaar._id, deletedAt: null },
  //   { hasBataidaar: false, bataidaarId: null, updatedAt: Date.now() }
  // );

  return { deleted: true };
};

const restoreBataidaar = async (bataidaarId, farmerId) => {
  const bataidaar = await Bataidaar.findOne({ bataidaarId, farmerId, deletedAt: { $ne: null } });
  if (!bataidaar) throw new AppError('Bataidaar not found in trash', 404);

  await Bataidaar.findOneAndUpdate({ bataidaarId }, { deletedAt: null, deletedBy: null });

  // await Crop.updateMany(
  //   { farmerId, _id: { $in: bataidaar.linkedCropIds }, deletedAt: null },
  //   { hasBataidaar: true, bataidaarId: bataidaar._id, updatedAt: Date.now() }
  // );

  return { restored: true };
};

module.exports = {
  getAllBataidaars,
  getBataidaarById,
  getBataidaarByCrop,
  createBataidaar,
  updateBataidaar,
  softDeleteBataidaar,
  restoreBataidaar,
};
