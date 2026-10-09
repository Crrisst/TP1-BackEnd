// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Entrada = require('../models/Entrada');
const Evento = require('../models/Evento');
const Transaccion = require('../models/Transaccion');

const verificarAdmin = (req, res, next) => {
  if (!req.session || !req.session.usuario || req.session.usuario.rol !== 'Administrador') {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarAdmin);

router.get('/dashboard', async (req, res) => {
  try {
    const totalUsuarios = await Usuario.countDocuments();
    const totalEventos = await Evento.countDocuments();
    const totalEntradas = await Entrada.countDocuments();
    const transacciones = await Transaccion.find();
    const recaudacionTotal = transacciones.reduce((acc, t) => acc + (t.total || 0), 0);

    res.render('Admin/dashboard', {
      usuarioLogueado: req.session.usuario,
      stats: {
        totalUsuarios,
        totalEventos,
        totalEntradas,
        recaudacionTotal
      }
    });
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    res.status(500).send('Error interno en dashboard.');
  }
});

router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.render('Admin/usuarios', {
      usuarioLogueado: req.session.usuario,
      usuarios,
      error: req.query.error
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).send('Error interno en usuarios.');
  }
});

router.get('/cancelaciones', async (req, res) => {
  try {
    const busqueda = req.query.usuario || '';
    const CancelacionLog = mongoose.models.CancelacionLog || mongoose.model('CancelacionLog');
    
    let filtro = {};
    if (busqueda.trim() !== '') {
      filtro.nombreCliente = { $regex: busqueda, $options: 'i' };
    }

    const cancelaciones = await CancelacionLog.find(filtro).sort({ fechaCancelacion: -1 });

    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones,
      busqueda
    });
  } catch (error) {
    res.render('Admin/cancelaciones', { usuarioLogueado: req.session.usuario, cancelaciones: [], busqueda: '' });
  }
});

router.get('/transacciones', async (req, res) => {
  try {
    const busquedaCliente = req.query.cliente || '';
    let filtro = {};
    if (busquedaCliente.trim() !== '') {
      filtro.nombreCliente = { $regex: busquedaCliente, $options: 'i' };
    }

    const listaTransacciones = await Transaccion.find(filtro).sort({ fechaCompra: -1 });
    const recaudacionTotal = listaTransacciones.reduce((acc, t) => acc + (t.total || 0), 0);

    res.render('Admin/transacciones', {
      usuarioLogueado: req.session.usuario,
      transacciones: listaTransacciones,
      recaudacionTotal,
      busquedaCliente
    });
  } catch (error) {
    console.error('Error al cargar transacciones:', error);
    res.status(500).send('Error interno al cargar la auditoría.');
  }
});

module.exports = router;