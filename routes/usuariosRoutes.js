const express = require('express');
const router = express.Router();
const { validateId, validateRequiredFields } = require('../middlewares');

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
  .post(validateRequiredFields(['nombre', 'email', 'password']), createUsuario);

// Rutas individuales por ID (obtener, actualizar y eliminar)
router.route('/:id')
  .get(validateId, getUsuarioById)
  .put(validateId, updateUsuario)
  .delete(validateId, deleteUsuario);

module.exports = router;