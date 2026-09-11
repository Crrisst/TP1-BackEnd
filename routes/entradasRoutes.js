const express = require('express');
const router = express.Router();

const { getEntradas, getEntradaById, createEntrada, updateEntrada, deleteEntrada } = require('../controllers/entradasController');

router.get('/', getEntradas);
router.get('/:id', getEntradaById);
router.post('/', createEntrada);
router.put('/:id', updateEntrada);
router.delete('/:id', deleteEntrada);

module.exports = router;