const express = require('express');
const router = express.Router();

const { 
  getSalas, 
  getSalaById, 
  createSala, 
  updateSala, 
  deleteSala,
  showEditSalaForm 
} = require('../controllers/salasController');

router.get('/', getSalas);

// Ruta para mostrar la vista de edición (Pug)
router.get('/:id/editar', showEditSalaForm);

router.get('/:id', getSalaById);
router.post('/', createSala);
router.put('/:id', updateSala);

// Ruta POST para procesar el formulario de edición desde la vista web
router.post('/:id/editar', updateSala);

router.delete('/:id', deleteSala);
router.post('/:id/delete', deleteSala);

module.exports = router;