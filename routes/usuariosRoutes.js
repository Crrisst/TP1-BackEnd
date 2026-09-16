const express = require('express');
const router = express.Router();

const { 
  validateId, 
  validateRequiredFields, 
  validateNameFormat,
  validateDniFormat,
  validateEmailFormat,
  validateTelefonoFormat
} = require('../middlewares');

const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  showEditUsuarioForm // <--- Importamos la nueva función
} = require('../controllers/usuarioController');

// Rutas Principales
router.route('/')
  .get(getUsuarios)
  .post(
    validateRequiredFields(['nombreUsuario', 'nombre', 'apellido', 'email', 'password', 'dni', 'fechaNacimiento', 'telefono']),
    validateNameFormat,
    validateEmailFormat,
    validateDniFormat,
    validateTelefonoFormat,
    createUsuario
  );

// NUEVAS RUTAS: Para la vista web de Editar
router.route('/:id/editar')
  .get(validateId, showEditUsuarioForm)
  .post(
    validateId,
    validateRequiredFields(['nombreUsuario', 'nombre', 'apellido', 'email', 'password', 'dni', 'fechaNacimiento', 'telefono']),
    validateNameFormat,
    validateEmailFormat,
    validateDniFormat,
    validateTelefonoFormat,
    updateUsuario
  );

// Rutas por ID (Para API)
router.route('/:id')
  .get(validateId, getUsuarioById)
  .put(validateId, updateUsuario)
  .delete(validateId, deleteUsuario); 

// Ruta web para eliminar
router.post('/:id/delete', validateId, deleteUsuario);

module.exports = router;