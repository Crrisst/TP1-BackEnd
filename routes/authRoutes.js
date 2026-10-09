// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validarRegistro } = require('../middlewares/validacionesMiddleware'); // <-- Importamos el middleware

// Rutas GET
router.get('/login', authController.mostrarLogin);
router.get('/registro', authController.mostrarRegistro);

// Rutas POST con validación previa
router.post('/login', authController.procesarLogin);
router.post('/registro', validarRegistro, authController.registrarCliente); // <-- Aplicado aquí

module.exports = router;