import express from 'express';
const router = express.Router();
import { verificarRol } from '../middlewares/authMiddleware.js';

import { 
  getEntradas, 
  getEntradaById, 
  createEntrada, 
  updateEntrada, 
  deleteEntrada 
} from '../controllers/entradasController.js';

// --- Middleware para verificar sesión activa ---
const estarLogueado = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    // Si es una petición de API/Fetch devuelve JSON, si es navegador redirige al login
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
      return res.status(401).json({ message: 'Acceso denegado. Debes iniciar sesión.' });
    }
    return res.redirect('/auth/login');
  }
  next();
};

// Rol exclusivo para modificaciones críticas
const soloAdmin = verificarRol(['Administrador']);

// 1. Proteger TODAS las rutas para que requieran estar logueado
router.use(estarLogueado);

// 2. Acciones permitidas para Clientes y Empleados
router.get('/', getEntradas);
router.get('/:id', getEntradaById);
router.post('/', createEntrada);

// 3. Modificar o borrar registros sensibles SOLO Administradores
router.put('/:id', soloAdmin, updateEntrada);
router.delete('/:id', soloAdmin, deleteEntrada);

export default router;