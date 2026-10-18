import express from 'express';
import { verificarRol, verificarAutenticacion } from '../middlewares/authMiddleware.js';
import { 
  getEntradas, 
  getEntradaById, 
  createEntrada, 
  updateEntrada, 
  deleteEntrada 
} from '../controllers/entradasController.js';

const router = express.Router();

// 1. Requerir autenticación previa para cualquier consulta de entradas
router.use(verificarAutenticacion);

// 2. Consultas y creación general
router.get('/', getEntradas);
router.get('/:id', getEntradaById);
router.post('/', createEntrada);

// 3. Modificaciones o eliminaciones sensibles exclusivas para Administrador
router.put('/:id', verificarRol(['Administrador']), updateEntrada);
router.delete('/:id', verificarRol(['Administrador']), deleteEntrada);

export default router;