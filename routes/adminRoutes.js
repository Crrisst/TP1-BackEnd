// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarRegistro } = require('../middlewares/validacionesMiddleware');

// Rutas GET
router.get('/login', authController.mostrarLogin);
router.get('/registro', authController.mostrarRegistro);

// 🚪 Ruta para cerrar sesión (Asegúrate de agregar esto)
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
});

// Rutas POST con validación previa
router.post('/login', authController.procesarLogin);
router.post('/registro', validarRegistro, authController.registrarCliente); // <-- Aplicado aquí[cite: 2]

module.exports = router;