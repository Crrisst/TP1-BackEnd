import express from 'express';
import * as controller from '../controllers/salasController.js';
import { validarSalaBody, validarSalaId } from '../middlewares/validateSala.js';
import { verificarRol } from '../middlewares/authMiddleware.js';

// --- Definición de Roles ---
const personalInterno = verificarRol(['Administrador', 'Supervisor', 'Lector']);
const adminYSupervisor = verificarRol(['Administrador', 'Supervisor']);
const soloAdmin = verificarRol(['Administrador']);

function rutasCrud(router) {
  // Lectura
  router.get('/', personalInterno, controller.getSalas);
  router.get('/:id', personalInterno, validarSalaId, controller.getSalaById);
  
  // Creación y Edición
  router.post('/', adminYSupervisor, validarSalaBody, controller.createSala);
  router.put('/:id', adminYSupervisor, validarSalaId, validarSalaBody, controller.updateSala);
  
  // Eliminación
  router.delete('/:id', soloAdmin, validarSalaId, controller.deleteSala);
  
  return router;
}

const router = rutasCrud(express.Router());

// Rutas para las vistas (Pug)
router.get('/:id/editar', adminYSupervisor, validarSalaId, controller.showEditSalaForm);
router.post('/:id/editar', adminYSupervisor, validarSalaId, validarSalaBody, controller.updateSala);
router.post('/:id/delete', soloAdmin, validarSalaId, controller.deleteSala);

// API
const apiRouter = express.Router();
apiRouter.use((req, res, next) => { req.esApiSalas = true; next(); });
rutasCrud(apiRouter);

// Exportaciones
router.apiRouter = apiRouter;
export { apiRouter };
export default router;