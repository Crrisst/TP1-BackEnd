// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const Entrada = require('../models/Entrada');

// Middleware para verificar que sea Administrador
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
    res.status(500).send('Error interno del servidor');
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
    res.status(500).send('Error interno del servidor');
  }
});

// Formulario para crear personal/usuario
router.get('/crear-personal', (req, res) => {
  res.render('Admin/crear-personal', {
    usuarioLogueado: req.session.usuario
  });
});

// Procesar creación de personal / usuario
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
    res.status(500).send('Error interno al crear el usuario: ' + error.message);
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
    res.status(500).send('Error interno del servidor');
  }
});

// Procesar actualización de usuario
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
    }, { runValidators: true });

    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).send('Error interno al actualizar: ' + error.message);
  }
});

// 🛡️ Auditoría de Cancelaciones / Entradas
router.get('/cancelaciones', async (req, res) => {
  try {
    const { usuario } = req.query;

    // Traemos todas las entradas vinculadas con cliente y evento
    const entradasEncontradas = await Entrada.find({})
      .populate('cliente')
      .populate('evento')
      .sort({ createdAt: -1 });

    // Mapeamos los datos para la vista de Pug
    let cancelaciones = entradasEncontradas.map(item => {
      return {
        nombreCliente: item.cliente ? `${item.cliente.nombre} ${item.cliente.apellido || ''} (${item.cliente.nombreUsuario})` : (item.nombreCliente || 'Cliente desconocido'),
        eventoNombre: item.evento ? item.evento.nombre : (item.nombre || 'Evento general'),
        codigoBoleto: item.codigoBoleto || 'N/D',
        fechaCancelacion: item.updatedAt || item.createdAt,
        estado: item.estado || 'Completado'
      };
    });

    // Si el usuario usó el buscador, filtramos los resultados por nombre de cliente o de usuario
    if (usuario && usuario.trim() !== '') {
      const termino = usuario.toLowerCase();
      cancelaciones = cancelaciones.filter(c => c.nombreCliente.toLowerCase().includes(termino));
    }

    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones,
      busquedaUsuario: usuario || ''
    });
  } catch (error) {
    console.error('Error al cargar la auditoría de cancelaciones:', error);
    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones: [],
      busquedaUsuario: req.query.usuario || ''
    });
  }
});

module.exports = router;