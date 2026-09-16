const requestLogger = require('./logger.middleware');
// Sumamos las nuevas validaciones a la importación
const { 
  validateId, 
  validateRequiredFields, 
  validateNameFormat,
  validateDniFormat,
  validateEmailFormat,
  validateTelefonoFormat
} = require('./validator.middleware');
const { notFoundHandler, errorHandler } = require('./errorHandler.middleware');
const asyncHandler = require('./asyncHandler.middleware');

module.exports = {
  requestLogger,
  validateId,
  validateRequiredFields,
  validateNameFormat,
  validateDniFormat,
  validateEmailFormat,
  validateTelefonoFormat,
  notFoundHandler,
  errorHandler,
  asyncHandler
};