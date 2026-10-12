/**
 * Middlewares de Manejo Global de Errores y Rutas No Encontradas
 */

/**
 * Captura solicitudes a rutas no existentes (404).
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Middleware centralizado de gestión de errores (500).
 * Captura cualquier error no controlado enviado mediante next(err).
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Error interno del servidor.';
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Conflicto: ya existe un registro con ese valor único.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Identificador o valor con formato no válido.';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(error => error.message).join(' ');
  }
  if (statusCode >= 500) {
    console.error(`[Error Interno]: ${err.stack || err.message || err}`);
    message = 'Error interno del servidor.';
  }
  res.status(statusCode).json(req.esApiSalas ? { error: message } : {
    status: 'error', message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/*module.exports = {
  notFoundHandler,
  errorHandler
};
*/
export {
  notFoundHandler,
  errorHandler
};
