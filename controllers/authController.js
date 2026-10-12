import Usuario from '../models/Usuario.js';

const procesarLogin = async (req, res) => {
  try {
    const { identificador, nombreUsuario, password } = req.body;
    const userField = identificador || nombreUsuario;
    
    // Búsqueda directa por usuario/email y contraseña en texto plano
    const usuario = await Usuario.findOne({
      $or: [
        { nombreUsuario: userField },
        { email: userField }
      ],
      password
    });
    
    if (!usuario) {
      return res.status(400).render('auth/login', { error: 'Credenciales inválidas. Usuario o contraseña incorrectos.' });
    }

    req.session.usuario = {
      id: usuario._id,
      _id: usuario._id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
      tipoCliente: usuario.tipoCliente,
      porcentajeDescuento: usuario.porcentajeDescuento
    };

    if (['Administrador', 'Supervisor', 'Lector'].includes(usuario.rol)) {
      return res.redirect('/admin/dashboard');
    }
    
    return res.redirect('/cliente/menu');
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).render('auth/login', { error: 'Error interno en el servidor al intentar iniciar sesión.' });
  }
};

const registrarCliente = async (req, res) => {
  try {
    const { nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono } = req.body;
    
    const usuarioExistente = await Usuario.findOne({ $or: [{ email }, { nombreUsuario }] });
    if (usuarioExistente) {
      return res.status(400).render('auth/registro', { error: 'El email o nombre de usuario ya está registrado en el sistema.' });
    }

    const nuevoUsuario = await Usuario.create({
      nombreUsuario,
      nombre,
      apellido,
      email,
      password,
      dni,
      fechaNacimiento,
      telefono,
      rol: 'Cliente',
      tipoCliente: 'ESTANDAR',
      porcentajeDescuento: 0
    });

    req.session.usuario = {
      id: nuevoUsuario._id,
      _id: nuevoUsuario._id,
      nombreUsuario: nuevoUsuario.nombreUsuario,
      rol: nuevoUsuario.rol,
      tipoCliente: nuevoUsuario.tipoCliente,
      porcentajeDescuento: nuevoUsuario.porcentajeDescuento
    };

    return res.redirect('/cliente/membresia');
    
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).render('auth/registro', { error: 'Error interno al registrar el usuario.' });
  }
};

export {
  procesarLogin,
  registrarCliente
};