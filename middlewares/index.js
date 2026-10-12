/*const requestLogger = require('./logger.middleware');
const { notFoundHandler, errorHandler } = require('./errorHandler.middleware');
const asyncHandler = require('./asyncHandler.middleware');*/

import  requestLogger  from './logger.middleware.js';
import { notFoundHandler, errorHandler } from './errorHandler.middleware.js';
import asyncHandler  from './asyncHandler.middleware.js';

/*module.exports = {
  requestLogger,
  notFoundHandler,
  errorHandler,
  asyncHandler
};*/

export {
  requestLogger,
  notFoundHandler,
  errorHandler,
  asyncHandler
};