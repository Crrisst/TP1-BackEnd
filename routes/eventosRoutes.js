const express = require('express');
const router = express.Router();

const { 
  getEventos, 
  getEventoById, 
  createEvento, 
  updateEvento, 
  deleteEvento,
  showEditEventoForm 
} = require('../controllers/eventosController');

router.get('/', getEventos);

// Ruta para mostrar la vista de edición (Pug)
router.get('/:id/editar', showEditEventoForm);

router.get('/:id', getEventoById);
router.post('/', createEvento);
router.put('/:id', updateEvento);

// Ruta POST para procesar el formulario de edición desde la vista web
router.post('/:id/editar', updateEvento);

router.delete('/:id', deleteEvento);
router.post('/:id/delete', deleteEvento);

module.exports = router;