// src/middlewares/authMiddleware.js
const verificarRol = (rolesPermitidos) => {
  return (req, res, next) => {
    const usuarioLogueado = req.session && req.session.usuario;

    if (!usuarioLogueado) {
      return res.redirect('/auth/login');
    }

    if (!rolesPermitidos.includes(usuarioLogueado.rol)) {
      return res.status(403).send('Acceso denegado: No tienes permisos suficientes para realizar esta acción.');
    }

    next();
  };
};

module.exports = {
  verificarRol
};