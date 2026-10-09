// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Transaccion = require('../models/Transaccion');

const verificarAdmin = (req, res, next) => {
  if (!req.session || !req.session.usuario || req.session.usuario.rol !== 'Administrador') {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarAdmin);

// 🎛️ Panel de Control (Dashboard) del Administrador
router.get('/dashboard', async (req, res) => {
  try {
    res.render('Admin/dashboard', {
      usuarioLogueado: req.session.usuario
    });
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    res.status(500).send('Error interno');
  }
});

// Panel de transacciones / auditoría
router.get('/transacciones', async (req, res) => {
  try {
    const transacciones = await Transaccion.find({}).sort({ fechaCompra: -1 });
    res.render('Admin/transacciones', {
      usuarioLogueado: req.session.usuario,
      transacciones
    });
  } catch (error) {
    console.error('Error al cargar transacciones:', error);
    res.status(500).send('Error interno');
  }
});

// Listado de usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({});
    res.render('Admin/usuarios', {
      usuarioLogueado: req.session.usuario,
      usuarios
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    res.status(500).send('Error interno');
  }
});

// 📋 Vista de Cancelaciones
router.get('/cancelaciones', async (req, res) => {
  try {
    const CancelacionLog = req.app.models?.CancelacionLog || require('mongoose').models.CancelacionLog;
    const cancelaciones = CancelacionLog ? await CancelacionLog.find({}).sort({ fechaCancelacion: -1 }) : [];

    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones
    });
  } catch (error) {
    console.error('Error al cargar cancelaciones:', error);
    res.status(500).send('Error interno');
  }
});

// Formulario para crear personal/usuario
router.get('/crear-personal', (req, res) => {
  res.render('Admin/crear-personal', {
    usuarioLogueado: req.session.usuario
  });
});

// Procesar creación de personal / usuario con validaciones
router.post('/crear-personal', async (req, res) => {
  try {
    const { 
      nombreUsuario, 
      nombre, 
      apellido, 
      email, 
      password, 
      dni, 
      fechaNacimiento, 
      telefono, 
      rol, 
      tipoCliente, 
      porcentajeDescuento 
    } = req.body;

    await Usuario.create({
      nombreUsuario,
      nombre,
      apellido,
      email,
      password,
      dni,
      fechaNacimiento,
      telefono,
      rol: rol || 'Administrador',
      tipoCliente: tipoCliente || 'ESTANDAR',
      porcentajeDescuento: porcentajeDescuento || 0
    });

    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).send('Error interno al crear el usuario (Verifique que los datos sean válidos): ' + error.message);
  }
});

// Formulario de edición de usuario
router.get('/usuarios/editar/:id', async (req, res) => {
  try {
    const usuarioAEditar = await Usuario.findById(req.params.id);
    if (!usuarioAEditar) return res.status(404).send('Usuario no encontrado');
    
    res.render('Admin/editarUsuario', {
      usuarioLogueado: req.session.usuario,
      usuarioAEditar
    });
  } catch (error) {
    console.error('Error al cargar edición de usuario:', error);
    res.status(500).send('Error interno');
  }
});

// Procesar actualización de usuario con { runValidators: true }
router.post('/usuarios/editar/:id', async (req, res) => {
  try {
    const { 
      nombreUsuario, 
      nombre, 
      apellido, 
      email, 
      dni, 
      fechaNacimiento, 
      telefono, 
      rol, 
      tipoCliente, 
      porcentajeDescuento 
    } = req.body;

    await Usuario.findByIdAndUpdate(req.params.id, {
      nombreUsuario,
      nombre,
      apellido,
      email,
      dni,
      fechaNacimiento,
      telefono,
      rol,
      tipoCliente,
      porcentajeDescuento
    }, { runValidators: true }); // 👈 Importante para validar esquemas en actualización

    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).send('Error interno al actualizar (Verifique las validaciones de campos): ' + error.message);
  }
});

module.exports = router;