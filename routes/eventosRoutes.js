import express from 'express';
const router = express.Router();
import { verificarRol } from '../middlewares/authMiddleware.js';

// --- Definición de Roles ---
const personalInterno = verificarRol(['Administrador', 'Supervisor', 'Lector']);
const adminYSupervisor = verificarRol(['Administrador', 'Supervisor']);
const soloAdmin = verificarRol(['Administrador']);

import {
  getEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
  showEditEventoForm,
  actualizarEntidad,
  eliminarEntidad
} from '../controllers/eventosController.js';

// --- RUTAS PROTEGIDAS ---

// Lectura (Todo el personal)
router.get('/', personalInterno, getEventos);
router.get('/:id', personalInterno, getEventoById);

// Creación y Edición (Admin y Supervisor)
router.get('/:id/editar', adminYSupervisor, showEditEventoForm);
router.post('/', adminYSupervisor, createEvento);
router.put('/:id', adminYSupervisor, updateEvento);
router.post('/:id/editar', adminYSupervisor, updateEvento);
router.post('/entidades/:id/editar', adminYSupervisor, actualizarEntidad);

// Eliminación (Solo Admin)
router.delete('/:id', soloAdmin, deleteEvento);
router.post('/:id/delete', soloAdmin, deleteEvento);
router.post('/entidades/:id/delete', soloAdmin, eliminarEntidad);

export default router;