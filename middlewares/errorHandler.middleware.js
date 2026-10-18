const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error interno:', err);
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor.';
  
  if (req.accepts(['html', 'json']) === 'json' || req.xhr) {
    return res.status(status).json({ status: 'error', message });
  }

  // Evitamos buscar vistas inexistentes y enviamos una respuesta HTML directa y segura
  res.status(status).send(`
    <div style="font-family: sans-serif; padding: 40px; text-align: center; background-color: #f8fafc; color: #334155;">
      <h1 style="color: #dc2626; margin-bottom: 10px;">¡Ups! Ocurrió un error (${status})</h1>
      <p style="font-size: 16px; margin-bottom: 20px; color: #64748b;">${message}</p>
      <a href="/admin/dashboard" style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Volver al Panel de Administración</a>
    </div>
  `);
};

// Exportación explícita para que index.js lo pueda leer
export { notFoundHandler, errorHandler };