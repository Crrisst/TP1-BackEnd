import express from 'express';
import Usuario from '../models/Usuario.js';
import Entrada from '../models/Entrada.js';
import Evento from '../models/Evento.js';
import Transaccion from '../models/Transaccion.js';
import CancelacionLog from '../models/CancelacionLog.js';
import Entidad from '../models/Entidad.js'; 

const router = express.Router();

const verificarClienteLogin = (req, res, next) => {
  if (!req.session || !req.session.usuario) return res.redirect('/auth/login');
  next();
};
router.use(verificarClienteLogin);

router.get('/menu', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    if (!usuarioCompleto) return res.redirect('/auth/login');
    res.render('Cliente/menu', { usuarioLogueado: req.session.usuario, usuarioCompleto, mensajeExito: req.query.exito || null });
  } catch (error) {
    res.status(500).send('Error interno.');
  }
});

router.get('/membresia', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    res.render('Cliente/membresia', { usuarioLogueado: req.session.usuario, usuarioCompleto, error: null, datos: {} });
  } catch (error) {
    res.status(500).send('Error interno.');
  }
});

router.post('/procesar-membresia', async (req, res) => {
  try {
    const { tipoCliente, numeroTarjeta, titular, vencimiento, cvv } = req.body;
    let porcentajeDescuento = 0;
    let planElegido = 'ESTANDAR';

    if (tipoCliente === 'PREMIUM') { porcentajeDescuento = 0.15; planElegido = 'PREMIUM'; }
    else if (tipoCliente === 'VIP') { porcentajeDescuento = 0.30; planElegido = 'VIP'; }
    
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });

    if (planElegido !== 'ESTANDAR') {
      if (!titular || titular.trim() === '' || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(titular.trim())) return res.status(400).render('Cliente/membresia', { usuarioLogueado: req.session.usuario, usuarioCompleto, error: 'Titular inválido.', datos: req.body });
      if (!numeroTarjeta || numeroTarjeta.trim() === '' || !/^\d{16}$/.test(numeroTarjeta.trim()) || numeroTarjeta.trim().endsWith('0000')) return res.status(400).render('Cliente/membresia', { usuarioLogueado: req.session.usuario, usuarioCompleto, error: 'Tarjeta inválida o fondos insuficientes.', datos: req.body });
      if (!vencimiento || vencimiento.trim() === '' || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento.trim())) return res.status(400).render('Cliente/membresia', { usuarioLogueado: req.session.usuario, usuarioCompleto, error: 'Vencimiento inválido.', datos: req.body });
      if (!cvv || cvv.trim() === '' || !/^\d{3}$/.test(cvv.trim())) return res.status(400).render('Cliente/membresia', { usuarioLogueado: req.session.usuario, usuarioCompleto, error: 'CVV inválido.', datos: req.body });
    }

    const usuarioId = req.session.usuario.id || req.session.usuario._id;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(usuarioId, { tipoCliente: planElegido, porcentajeDescuento }, { new: true });
    req.session.usuario.tipoCliente = usuarioActualizado.tipoCliente;
    req.session.usuario.porcentajeDescuento = usuarioActualizado.porcentajeDescuento;
    res.redirect('/cliente/menu?exito=¡Membresía configurada y cobro aprobado con éxito!');
  } catch (error) {
    res.status(500).send('Error interno al actualizar la membresía.');
  }
});

router.get('/mis-compras', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id || req.session.usuario._id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    
    if (!usuarioCompleto) return res.redirect('/auth/login');

    // Entradas activas populadas profundamente con sala y entidad (artista)
    const misEntradasCompradas = await Entrada.find({ cliente: usuarioCompleto._id }).populate({
      path: 'evento',
      populate: [
        { path: 'sala' },
        { path: 'entidad' }
      ]
    });

    // Historial de transacciones basado en el esquema de ítems
    const misCompras = await Transaccion.find({ cliente: usuarioCompleto._id })
      .sort({ fechaCompra: -1 });

    res.render('Cliente/compras', { usuarioLogueado: req.session.usuario, misEntradasCompradas, misCompras });
  } catch (error) {
    console.error('Error al cargar mis compras:', error);
    res.status(500).send('Error interno.');
  }
});

router.post('/cancelar-entrada/:id', async (req, res) => {
  try {
    const entradaARecuperar = await Entrada.findById(req.params.id).populate('evento');
    if (!entradaARecuperar) return res.status(404).json({ success: false, message: 'No se encontró la entrada.' });

    await CancelacionLog.create({
      cliente: entradaARecuperar.cliente,
      nombreCliente: req.session.usuario.nombreUsuario,
      eventoNombre: entradaARecuperar.evento ? entradaARecuperar.evento.nombre : 'Evento general',
      codigoBoleto: entradaARecuperar.codigoBoleto || 'TICK-' + entradaARecuperar._id.toString().slice(-6).toUpperCase(),
      cantidad: entradaARecuperar.cantidad || 1,
      fechaCancelacion: new Date()
    });

    if (entradaARecuperar.evento) await Evento.findByIdAndUpdate(entradaARecuperar.evento._id, { $inc: { entradasDisponibles: entradaARecuperar.cantidad || 1 } });
    await Entrada.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Entrada cancelada correctamente.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error interno al cancelar la entrada.' });
  }
});

router.get('/comprar', async (req, res) => {
  try {
    const busqueda = req.query.buscar ? req.query.buscar.trim() : '';
    let eventosDisponibles = [];

    if (busqueda) {
      const entidadesEncontradas = await Entidad.find({ nombre: { $regex: busqueda, $options: 'i' } });
      const idsEntidades = entidadesEncontradas.map(e => e._id);
      eventosDisponibles = await Evento.find({
        $or: [
          { nombre: { $regex: busqueda, $options: 'i' } },
          { entidad: { $in: idsEntidades } }
        ]
      }).populate('sala').populate('entidad');
    } else {
      eventosDisponibles = await Evento.find({}).populate('sala').populate('entidad');
    }

    const carrito = req.session.carrito || [];
    const totalItemsCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    res.render('Cliente/comprar', { usuarioLogueado: req.session.usuario, eventos: eventosDisponibles, totalItemsCarrito, busqueda });
  } catch (error) {
    res.status(500).send('Error interno al cargar los eventos: ' + error.message);
  }
});

export default router;