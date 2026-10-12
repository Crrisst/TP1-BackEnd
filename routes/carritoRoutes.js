import express from 'express';
const router = express.Router();
import Evento from '../models/Evento.js';
import Entrada from '../models/Entrada.js';
import Transaccion from '../models/Transaccion.js';

const verificarCliente = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarCliente);

// Ver el carrito
router.get('/', (req, res) => {
  if (!req.session.carrito) req.session.carrito = [];
  const carrito = req.session.carrito;

  const porcentajeDescuento = req.session.usuario ? (req.session.usuario.porcentajeDescuento || 0) : 0;
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const descuentoAplicado = subtotal * porcentajeDescuento;
  const total = subtotal - descuentoAplicado;

  res.render('Cliente/carrito', {
    usuarioLogueado: req.session.usuario,
    carrito,
    subtotal,
    descuentoAplicado,
    porcentajeDescuento: porcentajeDescuento * 100,
    total
  });
});

// Agregar ítems
router.post('/agregar', async (req, res) => {
  try {
    const { eventoId, cantidad, tipoEntrada } = req.body;
    const evento = await Evento.findById(eventoId);
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    const cantNum = parseInt(cantidad) || 1;
    if (cantNum <= 0) {
      return res.status(400).json({ success: false, message: 'La cantidad ingresada debe ser al menos 1.' });
    }

    if (!req.session.carrito) req.session.carrito = [];

    const cantidadYaEnCarrito = req.session.carrito
      .filter(item => item.eventoId === eventoId)
      .reduce((acc, item) => acc + item.cantidad, 0);

    const totalDeseado = cantidadYaEnCarrito + cantNum;

    if (totalDeseado > evento.entradasDisponibles) {
      const disponiblesRestantes = evento.entradasDisponibles - cantidadYaEnCarrito;
      return res.status(400).json({ 
        success: false, 
        message: `Stock insuficiente. Solo puedes agregar ${disponiblesRestantes} más.` 
      });
    }

    const precioOficial = evento.precio || 5000;
    const index = req.session.carrito.findIndex(item => item.eventoId === eventoId && item.tipoEntrada === tipoEntrada);
    
    if (index > -1) {
      req.session.carrito[index].cantidad += cantNum;
    } else {
      req.session.carrito.push({
        eventoId: evento._id.toString(),
        nombreEvento: evento.nombre,
        tipoEntrada: tipoEntrada || 'General',
        precio: precioOficial,
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
    res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
});

// Quitar ítem
router.get('/quitar/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (req.session.carrito && req.session.carrito[index]) {
    req.session.carrito.splice(index, 1);
  }
  res.redirect('/cliente/carrito');
});

// Checkout
router.get('/checkout', (req, res) => {
  const carrito = req.session.carrito || [];
  if (carrito.length === 0) return res.redirect('/cliente/carrito');

  const porcentajeDescuento = req.session.usuario ? (req.session.usuario.porcentajeDescuento || 0) : 0;
  const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const descuentoAplicado = subtotal * porcentajeDescuento;
  const total = subtotal - descuentoAplicado;

  res.render('Cliente/checkout', {
    usuarioLogueado: req.session.usuario,
    subtotal,
    descuentoAplicado,
    porcentajeDescuento: porcentajeDescuento * 100,
    total,
    error: null,
    datos: {}
  });
});

// Procesar Pago con Validaciones Estrictas
router.post('/procesar-pago', async (req, res) => {
  try {
    const carrito = req.session.carrito || [];
    if (carrito.length === 0) return res.redirect('/cliente/carrito');

    const { medioPago, numeroTarjeta, titular, vencimiento, cvv } = req.body;

    const calcularTotalesCheckout = () => {
      const porcentajeDescuento = req.session.usuario ? (req.session.usuario.porcentajeDescuento || 0) : 0;
      const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
      const descuentoAplicado = subtotal * porcentajeDescuento;
      const total = subtotal - descuentoAplicado;
      return { subtotal, descuentoAplicado, total };
    };

    // --- VALIDACIONES ESTRICTAS ---
    if (!titular || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(titular.trim())) {
      const { subtotal, descuentoAplicado, total } = calcularTotalesCheckout();
      return res.status(400).render('Cliente/checkout', {
        usuarioLogueado: req.session.usuario, subtotal, descuentoAplicado, total,
        error: 'El nombre del titular solo debe contener letras.', datos: req.body
      });
    }
    
    if (!numeroTarjeta || !/^\d{16}$/.test(numeroTarjeta.trim())) {
      const { subtotal, descuentoAplicado, total } = calcularTotalesCheckout();
      return res.status(400).render('Cliente/checkout', {
        usuarioLogueado: req.session.usuario, subtotal, descuentoAplicado, total,
        error: 'El número de tarjeta debe contener exactamente 16 dígitos.', datos: req.body
      });
    }

    // Validación estricta de mes real (01 a 12) y formato MM/AA
    if (!vencimiento || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento.trim())) {
      const { subtotal, descuentoAplicado, total } = calcularTotalesCheckout();
      return res.status(400).render('Cliente/checkout', {
        usuarioLogueado: req.session.usuario, subtotal, descuentoAplicado, total,
        error: 'El vencimiento es inválido. Debe tener formato MM/AA con un mes real entre 01 y 12.', datos: req.body
      });
    }

    if (!cvv || !/^\d{3}$/.test(cvv.trim())) {
      const { subtotal, descuentoAplicado, total } = calcularTotalesCheckout();
      return res.status(400).render('Cliente/checkout', {
        usuarioLogueado: req.session.usuario, subtotal, descuentoAplicado, total,
        error: 'El CVV debe contener exactamente 3 números.', datos: req.body
      });
    }

    if (numeroTarjeta.trim().endsWith('0000')) {
      const { subtotal, descuentoAplicado, total } = calcularTotalesCheckout();
      return res.status(400).render('Cliente/checkout', {
        usuarioLogueado: req.session.usuario, subtotal, descuentoAplicado, total,
        error: '❌ Pago rechazado por la entidad bancaria: Tarjeta inválida o fondos insuficientes.', datos: req.body
      });
    }
    // -----------------------------

    const usuarioId = req.session.usuario.id || req.session.usuario._id;
    const { subtotal, descuentoAplicado, total } = calcularTotalesCheckout();

    const comprobanteId = 'REC-' + Math.floor(10000000 + Math.random() * 90000000);
    const tarjetaUltimosDigitos = numeroTarjeta.slice(-4);

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
        estado: 'Completado',
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
      subtotal,
      descuentoAplicado,
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

export default router;