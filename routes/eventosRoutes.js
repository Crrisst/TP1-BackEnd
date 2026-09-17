const express = require('express');
const router = express.Router();
const { validateId, validateRequiredFields } = require('../middlewares');

const { getEventos, getEventoById, createEvento, updateEvento, deleteEvento,
    showEditEventoForm } = require('../controllers/eventosController');

router.get('/', getEventos);
router.get('/:id', validateId, getEventoById);
router.post('/', validateRequiredFields(['nombre', 'descripcion', 'fecha', 'hora']), createEvento);
router.put('/:id', validateId, updateEvento);
router.delete('/:id', validateId, deleteEvento);
router.post('/:id/delete', validateId, deleteEvento);
router.get('/:id/editar', validateId, showEditEventoForm);
router.post('/:id/update', validateId, updateEvento);


module.exports = router;

