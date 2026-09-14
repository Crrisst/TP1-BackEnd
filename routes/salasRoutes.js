const express = require('express');
const router = express.Router();
const { validateId, validateRequiredFields } = require('../middlewares');

const { getSalas, getSalaById, createSala, updateSala, deleteSala } = require('../controllers/salasController');

router.get('/', getSalas);
router.get('/:id', validateId, getSalaById);
router.post('/', validateRequiredFields(['nombre', 'descripcion', 'capacidad']), createSala);
router.put('/:id', validateId, updateSala);
router.delete('/:id', validateId, deleteSala);
router.post('/:id/delete', validateId, deleteSala);

module.exports = router;
