import Evento from '../models/Evento.js';
import Entrada from '../models/Entrada.js';
import Transaccion from '../models/Transaccion.js';

export const verCarrito = (req, res) => {
  const carrito = req.session.carrito || [];
  const subtotal = carrito.reduce((a, b) => a + (b.precio * b.cantidad), 0);
  
  // Solución al bug de punto flotante de JavaScript redondeando a 2 decimales
  const desc = Number((subtotal * (req.session.usuario.porcentajeDescuento || 0)).toFixed(2));
  const total = Number((subtotal - desc).toFixed(2));

  res.render('Cliente/carrito', { 
    usuarioLogueado: req.session.usuario, 
    carrito, 
    subtotal, 
    descuentoAplicado: desc, 
    porcentajeDescuento: (req.session.usuario.porcentajeDescuento || 0) * 100,
    total: total 
  });
};

export const agregarItem = async (req, res) => {
  try {
    const { eventoId, cantidad, tipoEntrada } = req.body;
    const evento = await Evento.findById(eventoId);
    if (!evento) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

    const cantNum = parseInt(cantidad) || 1;
    if (cantNum <= 0) return res.status(400).json({ success: false, message: 'La cantidad ingresada debe ser al menos 1.' });

    if (!req.session.carrito) req.session.carrito = [];

    const cantidadYaEnCarrito = req.session.carrito
      .filter(item => item.eventoId === eventoId)
      .reduce((acc, item) => acc + item.cantidad, 0);

    const totalDeseado = cantidadYaEnCarrito + cantNum;

    if (totalDeseado > evento.entradasDisponibles) {
      const disponiblesRestantes = evento.entradasDisponibles - cantidadYaEnCarrito;
      return res.status(400).json({ success: false, message: `Stock insuficiente. Solo puedes agregar ${disponiblesRestantes} más.` });
    }

    const precioOficial = evento.precio || 5000;
    const sectorElegido = ['General', 'Platea', 'VIP'].includes(tipoEntrada) ? tipoEntrada : 'General';
    const index = req.session.carrito.findIndex(item => item.eventoId === eventoId && item.tipoEntrada === sectorElegido);
    
    if (index > -1) {
      req.session.carrito[index].cantidad += cantNum;
    } else {
      req.session.carrito.push({
        eventoId: evento._id.toString(), nombreEvento: evento.nombre,
        tipoEntrada: sectorElegido, precio: precioOficial, cantidad: cantNum
      });
    }

    const totalItems = req.session.carrito.reduce((acc, item) => acc + item.cantidad, 0);
    const isApi = req.accepts(['html', 'json']) === 'json' || req.xhr;
    if (isApi) return res.json({ success: true, totalItems });

    res.redirect('/cliente/comprar');
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno en el servidor.' });
  }
};

export const quitarItem = (req, res) => {
  if (req.session.carrito) req.session.carrito.splice(req.params.index, 1);
  res.redirect('/cliente/carrito');
};

export const checkout = (req, res) => {
  const carrito = req.session.carrito || [];
  if (carrito.length === 0) return res.redirect('/cliente/carrito');

  const subtotal = carrito.reduce((a, b) => a + (b.precio * b.cantidad), 0);
  const desc = Number((subtotal * (req.session.usuario.porcentajeDescuento || 0)).toFixed(2));

  res.render('Cliente/checkout', { 
    usuarioLogueado: req.session.usuario, 
    subtotal, 
    descuentoAplicado: desc, 
    porcentajeDescuento: (req.session.usuario.porcentajeDescuento || 0) * 100,
    total: Number((subtotal - desc).toFixed(2)), 
    error: null, 
    datos: {}
  });
};

export const procesarPago = async (req, res) => {
  const carrito = req.session.carrito || [];
  if (!carrito.length) return res.redirect('/cliente/carrito');

  const entradasCreadas = [];
  const reservasRealizadas = [];

  try {
    const subtotal = carrito.reduce((a, b) => a + (b.precio * b.cantidad), 0);
    const descuentoAplicado = Number((subtotal * (req.session.usuario.porcentajeDescuento || 0)).toFixed(2));

    for (const item of carrito) {
      // 1. Reservamos la zona
      await Evento.reservarZona(item.eventoId, item.tipoEntrada, item.cantidad);
      reservasRealizadas.push({ eventoId: item.eventoId, zona: item.tipoEntrada, cantidad: item.cantidad });

      // 2. Creamos la entrada
      const nuevaEntrada = await Entrada.create({
        cliente: req.session.usuario._id, evento: item.eventoId, nombre: item.nombreEvento,
        precio: item.precio, cantidad: item.cantidad, sector: item.tipoEntrada,
        codigoBoleto: 'TICK-' + Math.floor(100000 + Math.random() * 900000)
      });
      entradasCreadas.push(nuevaEntrada._id);
    }

    // Extraemos los últimos 4 dígitos de la tarjeta para guardarlos correctamente
    const numTarjeta = req.body.numeroTarjeta ? req.body.numeroTarjeta.trim() : '';
    const ultimosDigitos = numTarjeta.length >= 4 ? numTarjeta.slice(-4) : '****';

    const nuevaTransaccion = await Transaccion.create({
      cliente: req.session.usuario._id, 
      nombreCliente: req.session.usuario.nombreUsuario, 
      items: carrito,
      subtotal, 
      descuentoAplicado, 
      total: Number((subtotal - descuentoAplicado).toFixed(2)),
      medioPago: req.body.medioPago || 'Tarjeta', 
      tarjetaUltimosDigitos: ultimosDigitos,
      comprobanteId: 'REC-' + Date.now()
    });

    req.session.carrito = [];
    res.render('Cliente/comprobante', { usuarioLogueado: req.session.usuario, transaccion: nuevaTransaccion });
  } catch (error) {
    // 🔄 ROLLBACK MANUAL: Si algo falla, borramos lo que creamos
    for (const entradaId of entradasCreadas) await Entrada.findByIdAndDelete(entradaId);
    for (const resv of reservasRealizadas) await Evento.liberarZona(resv.eventoId, resv.zona, resv.cantidad);
    
    res.status(400).send('No se pudo completar la transacción: ' + error.message);
  }
};