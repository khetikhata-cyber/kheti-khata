const { verifyToken } = require('../utils/jwtHelper');
const { sendUnauthorized } = require('../utils/apiResponse');
const Farmer = require('../models/Farmer.model');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return sendUnauthorized(res, 'No token provided. Please login.');
  }

  const decoded = verifyToken(token);

  const farmer = await Farmer.findOne({ farmerId: decoded.farmerId });
  if (!farmer) {
    return sendUnauthorized(res, 'Farmer no longer exists.');
  }

  req.farmer = farmer;
  next();
});

module.exports = { protect };
