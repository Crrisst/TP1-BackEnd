// routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Importamos los modelos principales que sí existen en tu proyecto
const Usuario = require('../models/Usuario');
const Entrada = require('../models/Entrada');
const Evento = require('../models/Evento');
const Sala = require('../models/Sala');

// Definimos de forma segura el esquema para registrar las cancelaciones (auditoría para administradores)
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

// Ruta principal del menú del cliente
router.get('/menu', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });

    if (!usuarioCompleto) {
      return res.redirect('/auth/login');
    }
    
    // Buscamos las entradas activas del cliente con sus relaciones
    const misEntradasCompradas = await Entrada.find({ cliente: usuarioCompleto._id })
      .populate({
        path: 'evento',
        populate: { path: 'sala' }
      });

    res.render('Cliente/menu', {
      usuarioLogueado: req.session.usuario,
      usuarioCompleto,
      misEntradasCompradas,
      misCompras: [], // Mantenemos el historial vacío de forma segura para evitar errores de módulos faltantes
      esNuevoRegistro: req.query.bienvenida === 'true'
    });
  } catch (error) {
    console.error('Error al cargar el menú del cliente:', error);
    res.render('Cliente/menu', {
      usuarioLogueado: req.session.usuario,
      usuarioCompleto: null,
      misEntradasCompradas: [],
      misCompras: [],
      esNuevoRegistro: false
    });
  }
});

// Ruta para cancelar la entrada, eliminarla de la vista y guardarla en la lista de auditoría del administrador
router.post('/cancelar-entrada/:id', async (req, res) => {
  try {
    const entradaId = req.params.id;
    
    // Buscamos la entrada antes de borrarla para registrar la auditoría
    const entradaARecuperar = await Entrada.findById(entradaId).populate('evento');

    if (!entradaARecuperar) {
      return res.status(404).json({ success: false, message: 'No se encontró la entrada en la base de datos.' });
    }

    // 1. Guardamos el registro de la cancelación para que los administradores puedan auditarlo
    await CancelacionLog.create({
      cliente: entradaARecuperar.cliente,
      nombreCliente: req.session.usuario.nombreUsuario,
      eventoNombre: entradaARecuperar.evento ? entradaARecuperar.evento.nombre : 'Evento general',
      codigoBoleto: entradaARecuperar.codigoBoleto || 'TICK-' + entradaARecuperar._id.toString().slice(-6).toUpperCase(),
      fechaCancelacion: new Date()
    });

    // 2. Eliminamos definitivamente la entrada activa de MongoDB
    await Entrada.findByIdAndDelete(entradaId);

    res.json({ success: true, message: 'Entrada cancelada correctamente y registrada para auditoría.' });
  } catch (error) {
    console.error('Error al cancelar la entrada:', error);
    res.status(500).json({ success: false, message: 'Error interno al procesar la cancelación.' });
  }
});

module.exports = router;