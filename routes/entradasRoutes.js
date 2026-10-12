//const express = require('express');
import express from 'express';
const router = express.Router();

//const { getEntradas, getEntradaById, createEntrada, updateEntrada, deleteEntrada } = require('../controllers/entradasController');

import { getEntradas, getEntradaById, createEntrada, updateEntrada, deleteEntrada } from '../controllers/entradasController.js';

router.get('/', getEntradas);
router.get('/:id', getEntradaById);
router.post('/', createEntrada);
router.put('/:id', updateEntrada);
router.delete('/:id', deleteEntrada);

//module.exports = router;
export default router;