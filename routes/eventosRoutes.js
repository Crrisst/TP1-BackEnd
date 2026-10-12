import express from 'express';
const router = express.Router();

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

router.get('/', getEventos);

// Rutas para gestionar artistas/entidades desde la misma sección
router.post('/entidades/:id/editar', actualizarEntidad);
router.post('/entidades/:id/delete', eliminarEntidad);

// Ruta para mostrar la vista de edición (Pug)
router.get('/:id/editar', showEditEventoForm);

router.get('/:id', getEventoById);
router.post('/', createEvento);
router.put('/:id', updateEvento);
router.post('/:id/editar', updateEvento);

router.delete('/:id', deleteEvento);
router.post('/:id/delete', deleteEvento);

export default router;