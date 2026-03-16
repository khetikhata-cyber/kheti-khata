const { v4: uuidv4 } = require('uuid');
const Farmer = require('../models/Farmer.model');
const { generateToken } = require('../utils/jwtHelper');
const AppError = require('../utils/AppError');

/**
 * Register a new farmer (called after OTP verified on device)
 */
const registerFarmer = async ({ mobile }) => {
  const existing = await Farmer.findOne({ mobile });
  if (existing) {
    // Already registered — just return a fresh token (re-login)
    const token = generateToken({ farmerId: existing.farmerId, mobile: existing.mobile });
    return { farmer: existing, token, isNewUser: false };
  }

  const farmerId = uuidv4(); // ← backend owns ID generation
  const farmer = await Farmer.create({ farmerId, mobile });
  const token = generateToken({ farmerId: farmer.farmerId, mobile: farmer.mobile });

  return { farmer, token, isNewUser: true };
};

/**
 * Login existing farmer
 */
const loginFarmer = async ({ mobile }) => {
  const farmer = await Farmer.findOne({ mobile });
  if (!farmer) {
    throw new AppError('Farmer not found. Please register first.', 404);
  }

  const token = generateToken({ farmerId: farmer.farmerId, mobile: farmer.mobile });
  return { farmer, token };
};

/**
 * Update farmer profile
 */
const updateProfile = async (farmerId, updateData) => {
  const farmer = await Farmer.findOneAndUpdate(
    { farmerId },
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!farmer) throw new AppError('Farmer not found', 404);
  return farmer;
};

/**
 * Get farmer by ID
 */
const getFarmerById = async (farmerId) => {
  const farmer = await Farmer.findOne({ farmerId });
  if (!farmer) throw new AppError('Farmer not found', 404);
  return farmer;
};

module.exports = { registerFarmer, loginFarmer, updateProfile, getFarmerById };
