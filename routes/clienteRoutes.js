const express = require('express');
const router = express.Router();

const Usuario = require('../models/Usuario');
const Entrada = require('../models/Entrada');
const Evento = require('../models/Evento');
const Transaccion = require('../models/Transaccion');
const CancelacionLog = require('../models/CancelacionLog');

const verificarClienteLogin = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarClienteLogin);

router.get('/menu', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    if (!usuarioCompleto) return res.redirect('/auth/login');

    res.render('Cliente/menu', {
      usuarioLogueado: req.session.usuario,
      usuarioCompleto,
      mensajeExito: req.query.exito || null
    });
  } catch (error) {
    console.error('Error al cargar el menú del cliente:', error);
    res.status(500).send('Error interno.');
  }
});

// GET /cliente/membresia - Mostrar tarjeta de beneficios y opciones de membresía
router.get('/membresia', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    res.render('Cliente/membresia', {
      usuarioLogueado: req.session.usuario,
      usuarioCompleto,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('Error al cargar la vista de membresías:', error);
    res.status(500).send('Error interno.');
  }
});

// POST /cliente/procesar-membresia - Actualizar nivel de membresía con simulación de pago
router.post('/procesar-membresia', async (req, res) => {
  try {
    const { tipoCliente, numeroTarjeta, titular } = req.body;
    let porcentajeDescuento = 0;
    let planElegido = 'ESTANDAR';

    if (tipoCliente === 'PREMIUM') {
      porcentajeDescuento = 0.15; // 15% de descuento
      planElegido = 'PREMIUM';
    } else if (tipoCliente === 'VIP') {
      porcentajeDescuento = 0.30; // 30% de descuento
      planElegido = 'VIP';
    } else {
      planElegido = 'ESTANDAR';
      porcentajeDescuento = 0;
    }

    // Validar tarjeta si elige planes pagos
    if (planElegido !== 'ESTANDAR' && (!numeroTarjeta || !titular)) {
      return res.redirect('/cliente/membresia?error=Para+los+planes+Premium+o+VIP+debes+ingresar+los+datos+de+pago.');
    }

    const usuarioId = req.session.usuario.id || req.session.usuario._id;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(usuarioId, {
      tipoCliente: planElegido,
      porcentajeDescuento
    }, { new: true });

    // Actualizar la sesión en tiempo real
    req.session.usuario.tipoCliente = usuarioActualizado.tipoCliente;
    req.session.usuario.porcentajeDescuento = usuarioActualizado.porcentajeDescuento;

    res.redirect('/cliente/menu?exito=¡Membresía configurada con éxito!');
  } catch (error) {
    console.error('Error al procesar la membresía:', error);
    res.status(500).send('Error interno al actualizar la membresía.');
  }
});

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
      cantidad: entradaARecuperar.cantidad || 1,
      fechaCancelacion: new Date()
    });

    if (entradaARecuperar.evento) {
      await Evento.findByIdAndUpdate(entradaARecuperar.evento._id, {
        $inc: { entradasDisponibles: entradaARecuperar.cantidad || 1 }
      });
    }

    await Entrada.findByIdAndDelete(entradaId);

    res.json({ success: true, message: 'Entrada cancelada correctamente.' });
  } catch (error) {
    console.error('Error al cancelar:', error);
    res.status(500).json({ success: false, message: 'Error interno al cancelar la entrada.' });
  }
});

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