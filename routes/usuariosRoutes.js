const express = require('express');
const router = express.Router();

const {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  showEditUsuarioForm
} = require('../controllers/usuarioController');

// Rutas Principales
router.route('/')
  .get(getUsuarios)
  .post(createUsuario);

// Rutas para la vista web de Editar
router.route('/:id/editar')
  .get(showEditUsuarioForm)
  .post(updateUsuario);

// Rutas por ID (Para API)
router.route('/:id')
  .get(getUsuarioById)
  .put(updateUsuario)
  .delete(deleteUsuario); 

// Ruta web para eliminar
router.post('/:id/delete', deleteUsuario);

module.exports = router;