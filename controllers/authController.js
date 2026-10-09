// src/controllers/authController.js
const Usuario = require('../models/Usuario');

// Mostrar vista de registro público
const mostrarRegistro = (req, res) => {
  res.render('auth/registro', { datos: {}, error: null });
};

// Procesar registro público (EXCLUSIVO PARA CLIENTES) y loguear automáticamente
const registrarCliente = async (req, res) => {
  try {
    const { nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, tipoCliente } = req.body;

    const nuevoCliente = new Usuario({
      nombreUsuario,
      nombre,
      apellido,
      email,
      password,
      dni,
      fechaNacimiento,
      telefono,
      rol: 'Cliente',
      tipoCliente: tipoCliente || 'ESTANDAR',
      porcentajeDescuento: tipoCliente === 'VIP' ? 0.3 : 0
    });

    const clienteGuardado = await nuevoCliente.save();

    // Creamos la sesión automáticamente al registrarse con éxito
    req.session.usuario = {
      id: clienteGuardado._id,
      nombreUsuario: clienteGuardado.nombreUsuario,
      email: clienteGuardado.email,
      rol: clienteGuardado.rol,
      nombre: clienteGuardado.nombre
    };

    // Redirigimos al menú principal del cliente con bandera de bienvenida
    res.redirect('/cliente/menu?bienvenida=true');
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(400).render('auth/registro', { 
      error: 'No se pudo completar el registro. Verifique si el email o nombre de usuario ya existen.', 
      datos: req.body 
    });
  }
};

// Mostrar vista de login
const mostrarLogin = (req, res) => {
  res.render('auth/login');
};

// Procesar el Login y guardar sesión (Permite email o nombre de usuario)
const procesarLogin = async (req, res) => {
  try {
    const { identificador, password } = req.body;

    const usuario = await Usuario.findOne({
      $or: [
        { email: identificador },
        { nombreUsuario: identificador }
      ],
      password: password
    });

    if (!usuario) {
      return res.status(401).render('auth/login', { error: 'Credenciales inválidas (Email/Usuario o contraseña incorrectos)' });
    }

    req.session.usuario = {
      id: usuario._id,
      nombreUsuario: usuario.nombreUsuario,
      email: usuario.email,
      rol: usuario.rol,
      nombre: usuario.nombre
    };

    // Si es Administrador va al panel admin, si es cliente va a su menú
    if (usuario.rol === 'Administrador') {
      return res.redirect('/admin/dashboard');
    }
    res.redirect('/cliente/menu');
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).render('auth/login', { error: 'Error interno del servidor' });
  }
};

module.exports = {
  mostrarRegistro,
  registrarCliente,
  mostrarLogin,
  procesarLogin
};