import Usuario from '../models/Usuario.js';
import CancelacionLog from '../models/CancelacionLog.js';
import Transaccion from '../models/Transaccion.js';

const mostrarFormularioCrearPersonal = (req, res) => {
  const rolActual = req.session.usuario && req.session.usuario.rol;
  if (rolActual !== 'Administrador') {
    return res.status(403).send('Acceso denegado: Solo los administradores pueden acceder al formulario de registro.');
  }

  res.render('Admin/crear-personal', {
    usuarioLogueado: req.session.usuario
  });
};

const registrarPersonalInterno = async (req, res) => {
  try {
    const rolActual = req.session.usuario && req.session.usuario.rol;
    if (rolActual !== 'Administrador') {
      return res.status(403).send('Acceso denegado.');
    }

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
      rol: rol || 'Cliente',
      tipoCliente: tipoCliente || 'ESTANDAR',
      porcentajeDescuento: porcentajeDescuento || 0
    });

    res.redirect('/admin/usuarios?exito=Usuario creado correctamente');
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    let mensajeError = 'No se pudo registrar el usuario. Verifique los datos ingresados.';
    if (error.code === 11000) {
      const campoDuplicado = Object.keys(error.keyValue || {})[0];
      if (campoDuplicado === 'nombreUsuario') {
        mensajeError = 'El nombre de usuario ya está registrado en el sistema.';
      } else if (campoDuplicado === 'email') {
        mensajeError = 'El correo electrónico ya está registrado en el sistema.';
      } else if (campoDuplicado === 'dni') {
        mensajeError = 'El DNI ya está registrado en el sistema.';
      } else {
        mensajeError = 'El nombre de usuario, email o DNI ya está registrado en el sistema.';
      }
    } else {
      mensajeError = error.errors?.fechaNacimiento?.message || error.message;
    }

    res.status(400).render('Admin/crear-personal', {
      error: mensajeError,
      usuarioLogueado: req.session.usuario
    });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    res.render('Admin/usuarios', {
      usuarioLogueado: req.session.usuario,
      usuarios,
      exito: req.query.exito || null
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).send('Error interno al obtener los usuarios');
  }
};

const mostrarFormularioEditarUsuario = async (req, res) => {
  try {
    const rolActual = req.session.usuario && req.session.usuario.rol;
    if (rolActual !== 'Administrador') {
      return res.status(403).send('Acceso denegado.');
    }

    const usuarioAEditar = await Usuario.findById(req.params.id);
    if (!usuarioAEditar) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.render('Admin/editarUsuario', {
      usuarioLogueado: req.session.usuario,
      usuarioAEditar
    });
  } catch (error) {
    console.error('Error al cargar edición:', error);
    res.status(500).send('Error al cargar el usuario');
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const rolActual = req.session.usuario && req.session.usuario.rol;
    if (rolActual !== 'Administrador') {
      return res.status(403).send('Acceso denegado.');
    }

    const { nombreUsuario, nombre, apellido, email, dni, fechaNacimiento, telefono, rol, tipoCliente, porcentajeDescuento } = req.body;
    
    await Usuario.findByIdAndUpdate(req.params.id, {
      nombreUsuario, nombre, apellido, email, dni, fechaNacimiento, telefono, rol, tipoCliente, porcentajeDescuento
    }, { runValidators: true });

    res.redirect('/admin/usuarios?exito=Usuario actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar:', error);
    
    let mensajeError = 'Error al actualizar el usuario.';
    if (error.code === 11000) {
      const campoDuplicado = Object.keys(error.keyValue || {})[0];
      if (campoDuplicado === 'nombreUsuario') {
        mensajeError = 'El nombre de usuario ya está registrado por otro usuario.';
      } else if (campoDuplicado === 'email') {
        mensajeError = 'El correo electrónico ya está registrado por otro usuario.';
      } else if (campoDuplicado === 'dni') {
        mensajeError = 'El DNI ya está registrado por otro usuario.';
      } else {
        mensajeError = 'El nombre de usuario, email o DNI ya pertenece a otro usuario registrado.';
      }
    } else {
      mensajeError = error.errors?.fechaNacimiento?.message || error.message;
    }
    
    const usuarioAEditar = (await Usuario.findById(req.params.id)) || { _id: req.params.id, ...req.body };
    res.status(400).render('Admin/editarUsuario', {
      usuarioLogueado: req.session.usuario,
      usuarioAEditar,
      error: mensajeError
    });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const rolActual = req.session.usuario && req.session.usuario.rol;
    if (rolActual !== 'Administrador') {
      return res.status(403).send('Acceso denegado.');
    }

    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/admin/usuarios?exito=Usuario eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar:', error);
    res.status(500).send('Error al eliminar el usuario');
  }
};

// 💳 Auditoría Exclusiva de Pagos y Compras
const listarAuditoriaPagos = async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = {};

    if (busqueda && busqueda.trim()) {
      const termino = busqueda.trim();
      const regex = new RegExp(termino, 'i');
      const esObjectId = /^[a-fA-F0-9]{24}$/.test(termino);

      const usuariosCoincidentes = await Usuario.find({
        $or: [
          { email: regex },
          { nombreUsuario: regex },
          { dni: regex },
          { nombre: regex },
          { apellido: regex }
        ]
      }).select('_id');
      
      const usuariosIds = usuariosCoincidentes.map(u => u._id);

      const condiciones = [
        { comprobanteId: regex },
        { nombreCliente: regex },
        { medioPago: regex },
        { 'items.nombreEvento': regex },
        { 'items.tipoEntrada': regex },
        { cliente: { $in: usuariosIds } }
      ];

      if (esObjectId) {
        condiciones.push({ _id: termino });
        condiciones.push({ cliente: termino });
        condiciones.push({ 'items.eventoId': termino });
      }

      query = { $or: condiciones };
    }

    const compras = await Transaccion.find(query)
      .populate('cliente')
      .sort({ fechaCompra: -1 });

    res.render('Admin/auditoriaPagos', {
      usuarioLogueado: req.session.usuario,
      compras,
      busqueda: busqueda || ''
    });
  } catch (error) {
    console.error('Error al listar las transacciones:', error);
    res.status(500).send('Error interno al obtener el historial de pagos');
  }
};

// 🚫 Auditoría Exclusiva de Cancelaciones (con filtro multicampo)
const listarCancelaciones = async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = {};

    if (busqueda && busqueda.trim()) {
      const termino = busqueda.trim();
      const regex = new RegExp(termino, 'i');
      const esObjectId = /^[a-fA-F0-9]{24}$/.test(termino);

      const condiciones = [
        { nombreCliente: regex },
        { eventoNombre: regex },
        { codigoBoleto: regex }
      ];

      if (esObjectId) {
        condiciones.push({ _id: termino });
        condiciones.push({ usuario: termino });
        condiciones.push({ evento: termino });
      }

      query = { $or: condiciones };
    }

    const cancelaciones = await CancelacionLog.find(query).sort({ fechaCancelacion: -1 });

    res.render('Admin/cancelaciones', {
      usuarioLogueado: req.session.usuario,
      cancelaciones,
      busqueda: busqueda || ''
    });
  } catch (error) {
    console.error('Error al listar cancelaciones:', error);
    res.status(500).send('Error interno al obtener el historial de cancelaciones');
  }
};

export {
  mostrarFormularioCrearPersonal,
  registrarPersonalInterno,
  listarUsuarios,
  mostrarFormularioEditarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  listarAuditoriaPagos,
  listarCancelaciones
};