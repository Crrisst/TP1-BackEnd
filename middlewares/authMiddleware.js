// src/middlewares/authMiddleware.js
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const usuarioLogueado = req.session && req.session.usuario;

    if (!usuarioLogueado) {
      return res.redirect('/auth/login');
    }

    if (!rolesPermitidos.includes(usuarioLogueado.rol)) {
      // Devolver una vista HTML estilizada en lugar de texto plano feo
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <title>Acceso Denegado</title>
          </head>
          <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f6f9; margin: 0;">
            <div style="background: white; padding: 35px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 450px; width: 100%;">
              <div style="font-size: 48px; margin-bottom: 15px;">🚫</div>
              <h2 style="color: #dc2626; margin-top: 0; margin-bottom: 10px;">Acceso Denegado</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
                No tienes los permisos necesarios ni el rol autorizado para realizar esta acción o ingresar a esta sección.
              </p>
              <a href="/admin/dashboard" style="background: #0ea5e9; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                ⬅️ Volver al Panel
              </a>
            </div>
          </body>
        </html>
      `);
    }

    next();
  };
};

module.exports = {
  verificarRol
};