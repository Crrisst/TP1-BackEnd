// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Importamos los modelos necesarios
const Usuario = require('../models/Usuario');
const Sala = require('../models/Sala');
const Evento = require('../models/Evento');

// Definición segura del esquema para la auditoría de cancelaciones
const cancelacionSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  nombreCliente: String,
  eventoNombre: String,
  codigoBoleto: String,
  fechaCancelacion: { type: Date, default: Date.now }
});
const CancelacionLog = mongoose.models.CancelacionLog || mongoose.model('CancelacionLog', cancelacionSchema);

// Middleware de verificación de sesión y rol de administrador
const verificarAdmin = (req, res, next) => {
  if (!req.session || !req.session.usuario) {
    return res.redirect('/auth/login');
  }
  next();
};

router.use(verificarAdmin);

// 1. Dashboard principal del Administrador
router.get(['/dashboard', '/'], async (req, res) => {
  try {
    res.render('Admin/dashboard', {
      usuarioLogueado: req.session.usuario
    });
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    res.status(500).send('Error interno al cargar el panel.');
  }
});

// 2. Ruta de Auditoría de Cancelaciones con buscador por usuario
router.get('/cancelaciones', async (req, res) => {
  try {
    const busquedaUsuario = req.query.usuario || '';
    
    let filtro = {};
    if (busquedaUsuario.trim() !== '') {
      filtro.nombreCliente = { $regex: busquedaUsuario, $options: 'i' };
    }

    const cancelaciones = await CancelacionLog.find(filtro).sort({ fechaCancelacion: -1 });

    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones,
      busquedaUsuario
    });
  } catch (error) {
    console.error('Error al cargar la auditoría de cancelaciones:', error);
    res.status(500).send('Error interno del servidor al cargar la auditoría.');
  }
});

// 3. Ruta para Gestión de Usuarios y Personal
router.get('/usuarios', async (req, res) => {
  try {
    const listaUsuarios = await Usuario.find({});
    res.render('Admin/usuarios', {
      usuarioLogueado: req.session.usuario,
      usuarios: listaUsuarios,
      exito: req.query.exito || null
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    res.status(500).send('Error al cargar la gestión de usuarios.');
  }
});

// 4. Ruta GET para mostrar el formulario de edición de un usuario específico
router.get('/usuarios/editar/:id', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const usuario = await Usuario.findById(usuarioId);

    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    res.render('Admin/editarUsuario', {
      usuarioLogueado: req.session.usuario,
      usuario,
      error: null
    });
  } catch (error) {
    console.error('Error al buscar usuario para editar:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// 5. Ruta POST para guardar los cambios de la edición del usuario en MongoDB
router.post('/usuarios/editar/:id', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const { nombreUsuario, nombre, apellido, email, dni, telefono, rol, tipoCliente } = req.body;

    await Usuario.findByIdAndUpdate(usuarioId, {
      nombreUsuario,
      nombre,
      apellido,
      email,
      dni,
      telefono,
      rol,
      tipoCliente: rol === 'Cliente' ? tipoCliente : undefined
    });

    res.redirect('/admin/usuarios?exito=Usuario actualizado correctamente');
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    const usuario = await Usuario.findById(req.params.id);
    res.render('Admin/editarUsuario', {
      usuarioLogueado: req.session.usuario,
      usuario,
      error: 'No se pudo actualizar el usuario. Verifique los datos.'
    });
  }
});

// 6. Ruta POST para eliminar un usuario con validación de seguridad estricta
router.post('/usuarios/eliminar/:id', async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const usuarioAEliminar = await Usuario.findById(usuarioId);

    if (!usuarioAEliminar) {
      return res.redirect('/admin/usuarios?exito=Usuario no encontrado');
    }

    // SEGURIDAD REFORZADA: Bloquea el borrado si es Administrador o el usuario maestro 'admin'
    if (usuarioAEliminar.rol === 'Administrador' || usuarioAEliminar.nombreUsuario === 'admin') {
      return res.redirect('/admin/usuarios?exito=Acción denegada: No se pueden eliminar cuentas con privilegios de Administrador.');
    }

    await Usuario.findByIdAndDelete(usuarioId);
    res.redirect('/admin/usuarios?exito=Usuario eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).send('Error interno al eliminar el usuario.');
  }
});

// 7. Ruta para Alta de Personal Interno (Vista GET)
router.get('/crear-personal', async (req, res) => {
  try {
    res.render('Admin/crear-personal', {
      usuarioLogueado: req.session.usuario,
      error: null
    });
  } catch (error) {
    console.error('Error al cargar la vista de creación de personal:', error);
    res.status(500).send('Error interno.');
  }
});

// 8. Ruta para Procesar el Alta de Personal (POST)
router.post('/crear-personal', async (req, res) => {
  try {
    const { nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, rol } = req.body;
    
    const existe = await Usuario.findOne({ $or: [{ nombreUsuario }, { email }, { dni }] });
    if (existe) {
      return res.render('Admin/crear-personal', {
        usuarioLogueado: req.session.usuario,
        error: 'El nombre de usuario, email o DNI ya se encuentran registrados.'
      });
    }

    await Usuario.create({
      nombreUsuario,
      nombre,
      apellido,
      email,
      password,
      dni,
      fechaNacimiento,
      telefono,
      rol
    });

    res.redirect('/admin/usuarios?exito=Personal interno registrado correctamente');
  } catch (error) {
    console.error('Error al crear personal:', error);
    res.render('Admin/crear-personal', {
      usuarioLogueado: req.session.usuario,
      error: 'Error interno al procesar el registro.'
    });
  }
});

module.exports = router;