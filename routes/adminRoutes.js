/*const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarRol } = require('../middlewares/authMiddleware');*/

import express from 'express';
const router = express.Router();
import * as adminController  from '../controllers/adminController.js';
import { verificarRol } from '../middlewares/authMiddleware.js';

const soloAdmin = verificarRol(['Administrador']);
const personalInterno = verificarRol(['Administrador', 'Supervisor', 'Lector']);

// Dashboard del panel (permitido para todo el personal interno)
router.get('/dashboard', personalInterno, (req, res) => {
  res.render('Admin/dashboard', {
    usuarioLogueado: req.session.usuario
  });
});

// --- GESTIÓN DE USUARIOS ---
// Listado permitido para personal interno (Visualización)
router.get('/usuarios', personalInterno, adminController.listarUsuarios);

// Acciones de modificación y creación (Exclusivas para Administradores)
router.get('/crear-personal', soloAdmin, adminController.mostrarFormularioCrearPersonal);
router.post('/crear-personal', soloAdmin, adminController.registrarPersonalInterno);

router.get('/usuarios/editar/:id', soloAdmin, adminController.mostrarFormularioEditarUsuario);
router.post('/usuarios/editar/:id', soloAdmin, adminController.actualizarUsuario);

router.post('/usuarios/eliminar/:id', soloAdmin, adminController.eliminarUsuario);

// --- CANCELACIONES ---
router.get('/cancelaciones', personalInterno, adminController.listarCancelaciones);

//module.exports = router;

export default router;