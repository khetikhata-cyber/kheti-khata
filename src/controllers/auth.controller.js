const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/apiResponse');
const otpService = require('../services/otp.service');

// POST /api/v1/auth/send-otp
const sendOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;
  const result = await otpService.sendOtp(mobile);
  return sendSuccess(res, result);
});

// POST /api/v1/auth/verify-otp
const verifyOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;

  // Step 1 — Verify OTP
  await otpService.verifyOtp(mobile, otp);

  // Step 2 — Register or login farmer
  const { farmer, token, isNewUser } = await authService.registerFarmer({ mobile });

  return sendCreated(res, {
    message: isNewUser ? 'Registration successful' : 'Login successful',
    data: { token, isNewUser, farmer },
  });
});

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

module.exports = { register, login, getMe, updateProfile, sendOtp, verifyOtp };
