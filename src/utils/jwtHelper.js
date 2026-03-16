const jwt = require('jsonwebtoken');
const appConfig = require('../config/app');

const generateToken = (payload) => {
  return jwt.sign(payload, appConfig.jwt.secret, {
    expiresIn: appConfig.jwt.expiresIn,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, appConfig.jwt.secret);
};

module.exports = { generateToken, verifyToken };
