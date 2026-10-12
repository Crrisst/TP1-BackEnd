import express from 'express';
import { 
  getSalas, 
  createSala, 
  showEditSalaForm, 
  updateSala, 
  deleteSala 
} from '../controllers/salasController.js';
import { verificarRol } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 👁️ Ver listado de salas (Administrador, Supervisor y Lector)
router.get('/', verificarRol(['Administrador', 'Supervisor', 'Lector']), getSalas);

// 🔒 Crear sala (Solo Administrador y Supervisor)
router.post('/', verificarRol(['Administrador', 'Supervisor']), createSala);

// 🔒 Mostrar formulario de edición de sala (Solo Administrador y Supervisor)
router.get('/editar/:id', verificarRol(['Administrador', 'Supervisor']), showEditSalaForm);

// 🔒 Guardar cambios de edición de sala (Soporta /editar/:id y /actualizar/:id)
router.post('/editar/:id', verificarRol(['Administrador', 'Supervisor']), updateSala);
router.post('/actualizar/:id', verificarRol(['Administrador', 'Supervisor']), updateSala);

// 🔒 Eliminar sala (Solo Administrador y Supervisor)
router.post('/eliminar/:id', verificarRol(['Administrador', 'Supervisor']), deleteSala);

export default router;