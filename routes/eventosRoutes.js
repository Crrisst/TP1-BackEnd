import express from 'express';
import { 
  getEventos, 
  createEvento, 
  showEditEventoForm, 
  updateEvento, 
  deleteEvento 
} from '../controllers/eventosController.js';
import { verificarRol } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 👁️ Ver listado de eventos (Administrador, Supervisor y Lector)
router.get('/', verificarRol(['Administrador', 'Supervisor', 'Lector']), getEventos);

// 🔒 Crear evento (Solo Administrador y Supervisor)
router.post('/', verificarRol(['Administrador', 'Supervisor']), createEvento);

// 🔒 Mostrar formulario de edición (Solo Administrador y Supervisor)
router.get('/editar/:id', verificarRol(['Administrador', 'Supervisor']), showEditEventoForm);

// 🔒 Guardar cambios de edición
router.post('/editar/:id', verificarRol(['Administrador', 'Supervisor']), updateEvento);
router.post('/actualizar/:id', verificarRol(['Administrador', 'Supervisor']), updateEvento);

// 🔒 Eliminar evento (Solo Administrador y Supervisor)
router.post('/eliminar/:id', verificarRol(['Administrador', 'Supervisor']), deleteEvento);

// ¡Esta línea es la que faltaba!
export default router;