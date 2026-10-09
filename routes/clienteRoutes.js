// routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Usuario = require('../models/Usuario');
const Entrada = require('../models/Entrada');
const Evento = require('../models/Evento');
const Transaccion = require('../models/Transaccion');

const cancelacionSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  nombreCliente: String,
  eventoNombre: String,
  codigoBoleto: String,
  fechaCancelacion: { type: Date, default: Date.now }
});
const CancelacionLog = mongoose.models.CancelacionLog || mongoose.model('CancelacionLog', cancelacionSchema);

const verificarClienteLogin = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarClienteLogin);

// Menú principal limpio
router.get('/menu', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    if (!usuarioCompleto) return res.redirect('/auth/login');

    res.render('Cliente/menu', {
      usuarioLogueado: req.session.usuario,
      usuarioCompleto
    });
  } catch (error) {
    console.error('Error al cargar el menú del cliente:', error);
    res.status(500).send('Error interno.');
  }
});

// Mis compras y entradas activas
router.get('/mis-compras', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    
    const misEntradasCompradas = await Entrada.find({ cliente: usuarioCompleto._id }).populate('evento');
    const misCompras = await Transaccion.find({ cliente: usuarioCompleto._id }).sort({ fechaCompra: -1 });

    res.render('Cliente/compras', {
      usuarioLogueado: req.session.usuario,
      misEntradasCompradas,
      misCompras
    });
  } catch (error) {
    console.error('Error al cargar mis compras:', error);
    res.status(500).send('Error interno.');
  }
});

// Cancelar entrada
router.post('/cancelar-entrada/:id', async (req, res) => {
  try {
    const entradaId = req.params.id;
    const entradaARecuperar = await Entrada.findById(entradaId).populate('evento');

    if (!entradaARecuperar) return res.status(404).json({ success: false, message: 'No se encontró la entrada.' });

    await CancelacionLog.create({
      cliente: entradaARecuperar.cliente,
      nombreCliente: req.session.usuario.nombreUsuario,
      eventoNombre: entradaARecuperar.evento ? entradaARecuperar.evento.nombre : 'Evento general',
      codigoBoleto: entradaARecuperar.codigoBoleto || 'TICK-' + entradaARecuperar._id.toString().slice(-6).toUpperCase(),
      fechaCancelacion: new Date()
    });

    await Entrada.findByIdAndDelete(entradaId);
    res.json({ success: true, message: 'Entrada cancelada correctamente.' });
  } catch (error) {
    console.error('Error al cancelar:', error);
    res.status(500).json({ success: false, message: 'Error interno.' });
  }
});

// Cartelera con contador del carrito
router.get('/comprar', async (req, res) => {
  try {
    const eventosDisponibles = await Evento.find({}); 
    const carrito = req.session.carrito || [];
    const totalItemsCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    res.render('Cliente/comprar', {
      usuarioLogueado: req.session.usuario,
      eventos: eventosDisponibles,
      totalItemsCarrito
    });
  } catch (error) {
    console.error('Error al cargar la cartelera:', error);
    res.status(500).send('Error interno al cargar los eventos.');
  }
});

module.exports = router;