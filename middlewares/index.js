const requestLogger = require('./logger.middleware');
const { validateId, validateRequiredFields } = require('./validator.middleware');
const { notFoundHandler, errorHandler } = require('./errorHandler.middleware');
const asyncHandler = require('./asyncHandler.middleware');

module.exports = {
  requestLogger,
  validateId,
  validateRequiredFields,
  notFoundHandler,
  errorHandler,
  asyncHandler
};
