const { sendNotFound } = require('../utils/apiResponse');

const notFound = (req, res) => {
  sendNotFound(res, `Route ${req.originalUrl} not found`);
};

module.exports = notFound;
