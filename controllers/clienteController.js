import Usuario from '../models/Usuario.js';
import Entrada from '../models/Entrada.js';
import Evento from '../models/Evento.js';
import Transaccion from '../models/Transaccion.js';
import CancelacionLog from '../models/CancelacionLog.js';

export const mostrarMenu = async (req, res) => {
  const usuarioCompleto = await Usuario.findById(req.session.usuario._id);
  res.render('Cliente/menu', { usuarioLogueado: req.session.usuario, usuarioCompleto, mensajeExito: req.query.exito });
};

export const mostrarMembresia = async (req, res) => {
  res.render('Cliente/membresia', { 
    usuarioLogueado: req.session.usuario, 
    usuarioCompleto: await Usuario.findById(req.session.usuario._id), 
    error: null,
    datos: {} 
  });
};

export const procesarMembresia = async (req, res) => {
  const { tipoCliente, titular, numeroTarjeta, vencimiento, cvv } = req.body;
  
  // Validamos datos de tarjeta si eligió un plan pago
  if (['PREMIUM', 'VIP'].includes(tipoCliente)) {
    if (!titular || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(titular.trim())) {
      return res.status(400).render('Cliente/membresia', {
        usuarioLogueado: req.session.usuario,
        usuarioCompleto: await Usuario.findById(req.session.usuario._id),
        error: 'Por favor, ingresa un titular válido (solo letras).',
        datos: req.body
      });
    }
    if (!numeroTarjeta || !/^\d{16}$/.test(numeroTarjeta.trim())) {
      return res.status(400).render('Cliente/membresia', {
        usuarioLogueado: req.session.usuario,
        usuarioCompleto: await Usuario.findById(req.session.usuario._id),
        error: 'El número de tarjeta debe tener exactamente 16 dígitos.',
        datos: req.body
      });
    }
    if (!vencimiento || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento.trim())) {
      return res.status(400).render('Cliente/membresia', {
        usuarioLogueado: req.session.usuario,
        usuarioCompleto: await Usuario.findById(req.session.usuario._id),
        error: 'La fecha de vencimiento debe tener el formato MM/AA.',
        datos: req.body
      });
    }
    if (!cvv || !/^\d{3}$/.test(cvv.trim())) {
      return res.status(400).render('Cliente/membresia', {
        usuarioLogueado: req.session.usuario,
        usuarioCompleto: await Usuario.findById(req.session.usuario._id),
        error: 'El código CVV debe tener exactamente 3 dígitos.',
        datos: req.body
      });
    }
  }

  let porcentaje = tipoCliente === 'VIP' ? 0.30 : tipoCliente === 'PREMIUM' ? 0.15 : 0;
  const usuarioActualizado = await Usuario.findByIdAndUpdate(
    req.session.usuario._id, 
    { tipoCliente: tipoCliente || 'ESTANDAR', porcentajeDescuento: porcentaje }, 
    { new: true }
  );

  req.session.usuario.tipoCliente = usuarioActualizado.tipoCliente;
  req.session.usuario.porcentajeDescuento = usuarioActualizado.porcentajeDescuento;
  res.redirect('/cliente/menu?exito=Membresía actualizada');
};

export const mostrarMisCompras = async (req, res) => {
  const misEntradasCompradas = await Entrada.find({ cliente: req.session.usuario._id }).populate({ path: 'evento', populate: ['sala', 'entidad'] });
  const misCompras = await Transaccion.find({ cliente: req.session.usuario._id }).sort({ fechaCompra: -1 });
  res.render('Cliente/compras', { usuarioLogueado: req.session.usuario, misEntradasCompradas, misCompras });
};

export const cancelarEntrada = async (req, res) => {
  const entradaCancelada = await Entrada.cancelarEntradaZona(req.params.id, req.session.usuario._id);
  await CancelacionLog.create({
    cliente: entradaCancelada.cliente, nombreCliente: req.session.usuario.nombreUsuario,
    eventoNombre: entradaCancelada.nombre, codigoBoleto: entradaCancelada.codigoBoleto, cantidad: entradaCancelada.cantidad
  });
  res.json({ success: true, message: 'Entrada cancelada correctamente.' });
};

export const mostrarComprar = async (req, res) => {
  const eventosDisponibles = await Evento.find({}).populate('sala entidad');
  res.render('Cliente/comprar', { usuarioLogueado: req.session.usuario, eventos: eventosDisponibles, totalItemsCarrito: req.session.carrito?.length || 0, busqueda: '' });
};