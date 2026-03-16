const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');

const register = asyncHandler(async (req, res) => {
  const { farmer, token, isNewUser } = await authService.registerFarmer(req.body);
  return sendCreated(res, {
    message: isNewUser ? 'Farmer registered successfully' : 'Welcome back!',
    data: { farmer, token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { farmer, token } = await authService.loginFarmer(req.body);
  return sendSuccess(res, {
    message: 'Login successful',
    data: { farmer, token },
  });
});

const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    message: 'Profile fetched',
    data: req.farmer,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const farmer = await authService.updateProfile(req.farmer.farmerId, req.body);
  return sendSuccess(res, {
    message: 'Profile updated successfully',
    data: farmer,
  });
});

module.exports = { register, login, getMe, updateProfile };
