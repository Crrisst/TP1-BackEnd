const express = require('express');
const router = express.Router();
const { validateId, validateRequiredFields } = require('../middlewares');

const { getEntradas, getEntradaById, createEntrada, updateEntrada, deleteEntrada } = require('../controllers/entradasController');

router.get('/', getEntradas);
router.get('/:id', validateId, getEntradaById);
router.post('/', validateRequiredFields(['nombre', 'descripcion', 'precio', 'cantidad']), createEntrada);
router.put('/:id', validateId, updateEntrada);
router.delete('/:id', validateId, deleteEntrada);

module.exports = router;