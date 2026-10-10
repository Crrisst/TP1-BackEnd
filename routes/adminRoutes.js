const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const CancelacionLog = require('../models/CancelacionLog');

const verificarAdmin = (req, res, next) => {
  if (!req.session || !req.session.usuario || req.session.usuario.rol !== 'Administrador') {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarAdmin);

router.get('/dashboard', (req, res) => {
  res.render('Admin/dashboard', {
    usuarioLogueado: req.session.usuario,
    mensajeExito: req.query.exito || null
  });
});

router.get('/usuarios', adminController.listarUsuarios);
router.get('/crear-personal', adminController.mostrarFormularioCrearPersonal);
router.post('/crear-personal', adminController.registrarPersonalInterno);
router.get('/usuarios/editar/:id', adminController.mostrarFormularioEditarUsuario);
router.post('/usuarios/editar/:id', adminController.actualizarUsuario);
router.post('/usuarios/eliminar/:id', adminController.eliminarUsuario);

router.get('/cancelaciones', async (req, res) => {
  try {
    const { usuario } = req.query;
    let cancelaciones = await CancelacionLog.find({}).sort({ fechaCancelacion: -1 });

    if (usuario && usuario.trim() !== '') {
      const termino = usuario.toLowerCase();
      cancelaciones = cancelaciones.filter(c => c.nombreCliente && c.nombreCliente.toLowerCase().includes(termino));
    }

    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones,
      busquedaUsuario: usuario || ''
    });
  } catch (error) {
    console.error('Error al cargar la auditoría de cancelaciones:', error);
    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones: [],
      busquedaUsuario: req.query.usuario || ''
    });
  }
});

module.exports = router;