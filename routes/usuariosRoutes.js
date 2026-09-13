const express = require('express');
const router = express.Router();

const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
} = require('../controllers/usuarioController');

// Ruta principal para obtener todos los usuarios y crear uno nuevo
router.route('/')
  .get(getUsuarios)
  .post(createUsuario);

// Rutas individuales por ID (obtener, actualizar y eliminar)
router.route('/:id')
  .get(getUsuarioById)
  .put(updateUsuario)
  .delete(deleteUsuario);

module.exports = router;