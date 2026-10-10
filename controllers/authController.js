const Usuario = require('../models/Usuario');

const procesarLogin = async (req, res) => {
  try {
    const { identificador, nombreUsuario, password } = req.body;
    const userField = identificador || nombreUsuario;
    
    // Buscar el usuario en MongoDB por nombre de usuario O por email
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

    // Almacenar los datos clave en la sesión
    req.session.usuario = {
      id: usuario._id,
      nombreUsuario: usuario.nombreUsuario,
      rol: usuario.rol,
      tipoCliente: usuario.tipoCliente,
      porcentajeDescuento: usuario.porcentajeDescuento
    };

    // Redirección según el rol del usuario
    if (usuario.rol === 'Administrador') {
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
    
    // Validar si el email o nombre de usuario ya se encuentran registrados
    const usuarioExistente = await Usuario.findOne({ $or: [{ email }, { nombreUsuario }] });
    if (usuarioExistente) {
      return res.status(400).render('auth/registro', { error: 'El email o nombre de usuario ya está registrado en el sistema.' });
    }

    // Crear el nuevo usuario asignándole por defecto el plan Estándar (sin descuento)
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

    // Guardar los datos esenciales en la sesión activa
    req.session.usuario = {
      id: nuevoUsuario._id,
      nombreUsuario: nuevoUsuario.nombreUsuario,
      rol: nuevoUsuario.rol,
      tipoCliente: nuevoUsuario.tipoCliente,
      porcentajeDescuento: nuevoUsuario.porcentajeDescuento
    };

    // Redirigir obligatoriamente a la pantalla de selección de membresías post-registro
    return res.redirect('/cliente/membresia');
    
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).render('auth/registro', { error: 'Error interno al registrar el usuario.' });
  }
};

module.exports = {
  procesarLogin,
  registrarCliente
};