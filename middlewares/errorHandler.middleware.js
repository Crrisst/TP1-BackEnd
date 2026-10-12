const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error interno detectado:', err);

  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor.';

  const esPeticionApi = req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));

  if (esPeticionApi) {
    return res.status(status).json({
      status: 'error',
      message
    });
  }

  return res.status(status).send(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Error en el Servidor</title>
      </head>
      <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f6f9; margin: 0;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 500px; width: 100%;">
          <div style="font-size: 48px; margin-bottom: 15px;">⚠️</div>
          <h2 style="color: #dc2626; margin-top: 0; margin-bottom: 10px;">Error del Servidor (${status})</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">${message}</p>
          <a href="/admin/dashboard" style="background: #0ea5e9; color: white; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            ⬅️ Volver al Panel
          </a>
        </div>
      </body>
    </html>
  `);
};

export {
  notFoundHandler,
  errorHandler
};