// routes/carritoRoutes.js
const express = require('express');
const router = express.Router();
const Evento = require('../models/Evento');
const Entrada = require('../models/Entrada');
const Transaccion = require('../models/Transaccion');

const verificarCliente = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarCliente);

// Ver el carrito actual
router.get('/carrito', (req, res) => {
  if (!req.session.carrito) req.session.carrito = [];
  const carrito = req.session.carrito;
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  res.render('Cliente/carrito', {
    usuarioLogueado: req.session.usuario,
    carrito,
    total
  });
});

// Agregar ítems mediante AJAX sin salir de la cartelera
router.post('/carrito/agregar', async (req, res) => {
  try {
    const { eventoId, cantidad, tipoEntrada, precio } = req.body;
    const evento = await Evento.findById(eventoId);
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    if (!req.session.carrito) req.session.carrito = [];

    const cantNum = parseInt(cantidad) || 1;
    const precioNum = parseFloat(precio) || 0;

    const index = req.session.carrito.findIndex(item => item.eventoId === eventoId && item.tipoEntrada === tipoEntrada);
    if (index > -1) {
      req.session.carrito[index].cantidad += cantNum;
    } else {
      req.session.carrito.push({
        eventoId: evento._id.toString(),
        nombreEvento: evento.nombre || evento.titulo || 'Evento',
        tipoEntrada: tipoEntrada || 'General',
        precio: precioNum,
        cantidad: cantNum
      });
    }

    const totalItems = req.session.carrito.reduce((acc, item) => acc + item.cantidad, 0);

    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({ success: true, totalItems });
    }

    res.redirect('/cliente/comprar');
  } catch (error) {
    console.error('Error al agregar al carrito:', error);
    res.status(500).json({ success: false, message: 'Error interno' });
  }
});

// Quitar ítem
router.get('/carrito/quitar/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (req.session.carrito && req.session.carrito[index]) {
    req.session.carrito.splice(index, 1);
  }
  res.redirect('/cliente/carrito');
});

// Checkout
router.get('/carrito/checkout', (req, res) => {
  const carrito = req.session.carrito || [];
  if (carrito.length === 0) return res.redirect('/cliente/carrito');

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  res.render('Cliente/checkout', {
    usuarioLogueado: req.session.usuario,
    total
  });
});

// Procesar pago y guardar en BD
router.post('/carrito/procesar-pago', async (req, res) => {
  try {
    const carrito = req.session.carrito || [];
    if (carrito.length === 0) return res.redirect('/cliente/carrito');

    const { medioPago, numeroTarjeta } = req.body;
    const usuarioId = req.session.usuario._id || req.session.usuario.id;
    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const comprobanteId = 'REC-' + Math.floor(10000000 + Math.random() * 90000000);
    const tarjetaUltimosDigitos = numeroTarjeta ? numeroTarjeta.slice(-4) : '0000';

    for (const item of carrito) {
      const codigoBoleto = 'TICK-' + Math.floor(100000 + Math.random() * 900000);
      await Entrada.create({
        cliente: usuarioId,
        evento: item.eventoId,
        nombre: `${item.tipoEntrada} - ${item.nombreEvento}`,
        descripcion: `Acceso adquirido para ${item.nombreEvento}`,
        precio: item.precio,
        cantidad: item.cantidad,
        fila: 'Fila Única',
        asiento: 'General / Numerado',
        sector: item.tipoEntrada,
        estado: 'Completado (Historial)',
        codigoBoleto: codigoBoleto
      });

      await Evento.findByIdAndUpdate(item.eventoId, {
        $inc: { entradasDisponibles: -item.cantidad }
      });
    }

    const nuevaTransaccion = await Transaccion.create({
      cliente: usuarioId,
      nombreCliente: req.session.usuario.nombreUsuario,
      items: carrito,
      total,
      medioPago: medioPago || 'Tarjeta de Crédito',
      tarjetaUltimosDigitos,
      comprobanteId,
      fechaCompra: new Date()
    });

    req.session.carrito = [];

    res.render('Cliente/comprobante', {
      usuarioLogueado: req.session.usuario,
      transaccion: nuevaTransaccion
    });
  } catch (error) {
    console.error('Error al procesar pago:', error);
    res.status(500).send('Error al procesar el pago: ' + error.message);
  }
});

module.exports = router;