const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require('../validations/auth.validation');
const { authLimiter } = require('../middlewares/rateLimiter');

// Public routes
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
