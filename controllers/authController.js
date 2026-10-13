import Usuario from '../models/Usuario.js';

export const procesarLogin = async (req, res) => {
  try {
    const { identificador, nombreUsuario, password } = req.body;
    const user = identificador || nombreUsuario;
    
    // Buscamos directamente coincidencia exacta de usuario/email y contraseña en texto plano
    const usuario = await Usuario.findOne({ 
      $or: [{ nombreUsuario: user }, { email: user }],
      password: password 
    });
    
    if (!usuario) {
      return res.status(400).render('auth/login', { error: 'Credenciales inválidas. Usuario o contraseña incorrectos.' });
    }

    req.session.usuario = {
      _id: usuario._id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
      tipoCliente: usuario.tipoCliente,
      porcentajeDescuento: usuario.porcentajeDescuento
    };

    return ['Administrador', 'Supervisor', 'Lector'].includes(usuario.rol) 
      ? res.redirect('/admin/dashboard') 
      : res.redirect('/cliente/menu');
  } catch (error) {
    // 🔍 Mostramos el error real en la terminal para facilitar la depuración con MongoDB Atlas
    console.error('❌ ERROR REAL EN LOGIN:', error);
    return res.status(500).render('auth/login', { error: 'Error interno al intentar iniciar sesión.' });
  }
};

export const registrarCliente = async (req, res) => {
  try {
    const { nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono } = req.body;
    
    if (await Usuario.findOne({ $or: [{ email }, { nombreUsuario }] })) {
      return res.status(400).render('auth/registro', { error: 'El email o nombre de usuario ya está registrado en el sistema.' });
    }

    // Se guarda la contraseña tal cual la ingresó el usuario
    const nuevoUsuario = await Usuario.create({
      nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono
    });

    req.session.usuario = { 
      _id: nuevoUsuario._id, 
      nombreUsuario: nuevoUsuario.nombreUsuario, 
      rol: nuevoUsuario.rol 
    };
    
    return res.redirect('/cliente/membresia');
  } catch (error) {
    // 🔍 Mostramos el error real en la terminal para registro
    console.error('❌ ERROR REAL EN REGISTRO:', error);
    return res.status(500).render('auth/registro', { error: 'Error interno al registrar el usuario.' });
  }
};