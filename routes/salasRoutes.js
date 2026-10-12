import express from 'express';
import * as controller from '../controllers/salasController.js';
import { validarSalaBody, validarSalaId } from '../middlewares/validateSala.js';

function rutasCrud(router) {
  router.get('/', controller.getSalas);
  router.post('/', validarSalaBody, controller.createSala);
  router.get('/:id', validarSalaId, controller.getSalaById);
  router.put('/:id', validarSalaId, validarSalaBody, controller.updateSala);
  router.delete('/:id', validarSalaId, controller.deleteSala);
  return router;
}

const router = rutasCrud(express.Router());
router.get('/:id/editar', validarSalaId, controller.showEditSalaForm);
router.post('/:id/editar', validarSalaId, validarSalaBody, controller.updateSala);
router.post('/:id/delete', validarSalaId, controller.deleteSala);

const apiRouter = express.Router();
apiRouter.use((req, res, next) => { req.esApiSalas = true; next(); });
rutasCrud(apiRouter);

// Para soportar `salasRoutes.apiRouter` si se importa por default
router.apiRouter = apiRouter;

// Exportación nombrada de apiRouter y exportación por defecto de router
export { apiRouter };
export default router;