// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarRegistro } = require('../middlewares/validacionesMiddleware');

// Rutas GET
router.get('/login', authController.mostrarLogin); 
router.get('/registro', authController.mostrarRegistro); 

// 🚪 Ruta para cerrar sesión (Ultra segura)
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/auth/login');
    });
  } else {
    res.redirect('/auth/login');
  }
});

// Rutas POST con validación previa
router.post('/login', authController.procesarLogin); 
router.post('/registro', validarRegistro, authController.registrarCliente); 

module.exports = router; 