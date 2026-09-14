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
  console.error(`[Error Interno]: ${err.stack || err.message || err}`);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor.';

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
