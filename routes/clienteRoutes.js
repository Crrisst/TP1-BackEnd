/*const express = require('express');
const Usuario = require('../models/Usuario');
const Entrada = require('../models/Entrada');
const Evento = require('../models/Evento');
const Transaccion = require('../models/Transaccion');
const CancelacionLog = require('../models/CancelacionLog');*/

import express from 'express';
import Usuario from '../models/Usuario.js';
import Entrada from '../models/Entrada.js';
import Evento from '../models/Evento.js';
import Transaccion from '../models/Transaccion.js';
import CancelacionLog from '../models/CancelacionLog.js';

const router = express.Router();

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

// GET /cliente/membresia - Mostrar tarjeta de beneficios
router.get('/membresia', async (req, res) => {
  try {
    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });
    res.render('Cliente/membresia', {
      usuarioLogueado: req.session.usuario,
      usuarioCompleto,
      error: null,
      datos: {}
    });
  } catch (error) {
    console.error('Error al cargar la vista de membresías:', error);
    res.status(500).send('Error interno.');
  }
});

// POST /cliente/procesar-membresia - Actualizar nivel de membresía con validación rigurosa de campos vacíos
router.post('/procesar-membresia', async (req, res) => {
  try {
    const { tipoCliente, numeroTarjeta, titular, vencimiento, cvv } = req.body;
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

    const usuarioCompleto = await Usuario.findById(req.session.usuario.id) || 
                            await Usuario.findOne({ nombreUsuario: req.session.usuario.nombreUsuario });

    // Si elige un plan pago, exigimos estrictamente que TODOS los campos estén completos
    if (planElegido !== 'ESTANDAR') {
      if (!titular || titular.trim() === '' || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(titular.trim())) {
        return res.status(400).render('Cliente/membresia', {
          usuarioLogueado: req.session.usuario,
          usuarioCompleto,
          error: 'El nombre del titular es obligatorio y solo debe contener letras.',
          datos: req.body
        });
      }
      if (!numeroTarjeta || numeroTarjeta.trim() === '' || !/^\d{16}$/.test(numeroTarjeta.trim())) {
        return res.status(400).render('Cliente/membresia', {
          usuarioLogueado: req.session.usuario,
          usuarioCompleto,
          error: 'El número de tarjeta es obligatorio y debe contener exactamente 16 dígitos numéricos.',
          datos: req.body
        });
      }
      if (!vencimiento || vencimiento.trim() === '' || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(vencimiento.trim())) {
        return res.status(400).render('Cliente/membresia', {
          usuarioLogueado: req.session.usuario,
          usuarioCompleto,
          error: 'El vencimiento es obligatorio y debe tener formato MM/AA.',
          datos: req.body
        });
      }
      if (!cvv || cvv.trim() === '' || !/^\d{3}$/.test(cvv.trim())) {
        return res.status(400).render('Cliente/membresia', {
          usuarioLogueado: req.session.usuario,
          usuarioCompleto,
          error: 'El CVV es obligatorio y debe contener exactamente 3 números.',
          datos: req.body
        });
      }
      if (numeroTarjeta.trim().endsWith('0000')) {
        return res.status(400).render('Cliente/membresia', {
          usuarioLogueado: req.session.usuario,
          usuarioCompleto,
          error: '❌ Pago rechazado por el banco: Fondos insuficientes.',
          datos: req.body
        });
      }
    }

    const usuarioId = req.session.usuario.id || req.session.usuario._id;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(usuarioId, {
      tipoCliente: planElegido,
      porcentajeDescuento
    }, { new: true });

    // Actualizar la sesión en tiempo real
    req.session.usuario.tipoCliente = usuarioActualizado.tipoCliente;
    req.session.usuario.porcentajeDescuento = usuarioActualizado.porcentajeDescuento;

    res.redirect('/cliente/menu?exito=¡Membresía configurada y cobro aprobado con éxito!');
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
    const eventosDisponibles = await Evento.find({}).populate('sala'); 
    const carrito = req.session.carrito || [];
    const totalItemsCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);

    res.render('Cliente/comprar', {
      usuarioLogueado: req.session.usuario,
      eventos: eventosDisponibles,
      totalItemsCarrito
    });
  } catch (error) {
    console.error('Error al cargar la cartelera:', error);
    res.status(500).send('Error interno al cargar los eventos: ' + error.message);
  }
});

//module.exports = router;
export default router;