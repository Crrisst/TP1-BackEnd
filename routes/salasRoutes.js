const express = require('express');
const router = express.Router();

const { getSalas, getSalaById, createSala, updateSala, deleteSala } = require('../controllers/salasController');

router.get('/', getSalas);
router.get('/:id', getSalaById);
router.post('/', createSala);
router.put('/:id', updateSala);
router.delete('/:id', deleteSala);
router.post('/:id/delete', deleteSala);

module.exports = router;