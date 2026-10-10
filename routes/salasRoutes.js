const express = require('express');
const controller = require('../controllers/salasController');
const { validarSalaBody, validarSalaId } = require('../middlewares/validateSala');

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
module.exports = router;
module.exports.apiRouter = apiRouter;
