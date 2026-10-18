import Usuario from '../models/Usuario.js';
import CancelacionLog from '../models/CancelacionLog.js';
import Transaccion from '../models/Transaccion.js';
import Evento from '../models/Evento.js';
import crypto from 'crypto';

export const mostrarFormularioCrearPersonal = (req, res) => res.render('Admin/crear-personal', { usuarioLogueado: req.session.usuario, error: null, datos: {} });

export const registrarPersonalInterno = async (req, res) => {
  try {
    await Usuario.create(req.body);
    res.redirect('/admin/usuarios?exito=Usuario creado');
  } catch (error) {
    let mensajeError = 'Error al crear usuario. Verifica los datos.';
    if (error.code === 11000) {
      const campo = Object.keys(error.keyValue)[0];
      mensajeError = `El ${campo} ingresado ya está registrado en el sistema.`;
    } else if (error.message) {
      mensajeError = error.message;
    }
    // Devolvemos los datos previos para que el formulario no se borre
    res.status(400).render('Admin/crear-personal', { 
      error: mensajeError, 
      usuarioLogueado: req.session.usuario, 
      datos: req.body 
    });
  }
};

export const listarUsuarios = async (req, res) => {
  const usuarios = await Usuario.find().sort({ createdAt: -1 });
  res.render('Admin/usuarios', { usuarioLogueado: req.session.usuario, usuarios });
};

export const mostrarFormularioEditarUsuario = async (req, res) => {
  const usuarioAEditar = await Usuario.findById(req.params.id);
  res.render('Admin/editarUsuario', { usuarioLogueado: req.session.usuario, usuarioAEditar });
};

export const actualizarUsuario = async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
    res.redirect('/admin/usuarios?exito=Usuario actualizado');
  } catch (error) {
    let mensajeError = 'Error al actualizar usuario.';
    if (error.code === 11000) {
      const campo = Object.keys(error.keyValue)[0];
      mensajeError = `El ${campo} ingresado ya está registrado por otro usuario.`;
    } else if (error.message) {
      mensajeError = error.message;
    }
    const usuarioAEditar = await Usuario.findById(req.params.id) || { _id: req.params.id, ...req.body };
    res.status(400).render('Admin/editarUsuario', { usuarioLogueado: req.session.usuario, usuarioAEditar, error: mensajeError });
  }
};

export const eliminarUsuario = async (req, res) => {
  await Usuario.findByIdAndDelete(req.params.id);
  res.redirect('/admin/usuarios?exito=Eliminado');
};

export const listarAuditoriaPagos = async (req, res) => {
  try {
    const { busqueda, filtro } = req.query;
    let query = {};

    if (filtro === 'hoy') {
      const inicioHoy = new Date();
      inicioHoy.setHours(0, 0, 0, 0);
      const finHoy = new Date();
      finHoy.setHours(23, 59, 59, 999);
      
      query.fechaCompra = { $gte: inicioHoy,$lte: finHoy };
    }

    if (busqueda && busqueda.trim()) {
      const termino = busqueda.trim();
      const regex = new RegExp(termino, 'i');
      const esObjectId = /^[a-fA-F0-9]{24}$/.test(termino);

      const usuariosCoincidentes = await Usuario.find({
        $or: [{ email: regex }, { nombreUsuario: regex }, { dni: regex }, { nombre: regex }, { apellido: regex }]
      }).select('_id');
      
      const usuariosIds = usuariosCoincidentes.map(u => u._id);

      const condiciones = [
        { comprobanteId: regex }, { nombreCliente: regex }, { medioPago: regex },
        { 'items.nombreEvento': regex }, { 'items.tipoEntrada': regex }, { cliente: { $in: usuariosIds } }
      ];

      if (esObjectId) {
        condiciones.push({ _id: termino }, { cliente: termino }, { 'items.eventoId': termino });
      }

      if (query.fechaCompra) {
        query = { $and: [ { fechaCompra: query.fechaCompra }, {$or: condiciones } ] };
      } else {
        query = { $or: condiciones };
      }
    }

    const compras = await Transaccion.find(query).populate('cliente').sort({ fechaCompra: -1 });

    res.render('Admin/auditoriaPagos', { 
      usuarioLogueado: req.session.usuario, 
      compras, 
      busqueda: busqueda || '',
      filtroActual: filtro || ''
    });
  } catch (error) {
    console.error('Error al listar las transacciones:', error);
    res.status(500).send('Error interno al obtener el historial de pagos');
  }
};

export const listarCancelaciones = async (req, res) => {
  try {
    const { busqueda } = req.query;
    let query = {};

    if (busqueda && busqueda.trim()) {
      const termino = busqueda.trim();
      const regex = new RegExp(termino, 'i');
      const esObjectId = /^[a-fA-F0-9]{24}$/.test(termino);

      const condiciones = [{ nombreCliente: regex }, { eventoNombre: regex }, { codigoBoleto: regex }];
      if (esObjectId) condiciones.push({ _id: termino }, { cliente: termino }, { evento: termino });
      query = { $or: condiciones };
    }

    const cancelaciones = await CancelacionLog.find(query).sort({ fechaCancelacion: -1 });

    res.render('Admin/cancelaciones', { usuarioLogueado: req.session.usuario, cancelaciones, busqueda: busqueda || '' });
  } catch (error) {
    console.error('Error al listar cancelaciones:', error);
    res.status(500).send('Error interno al obtener el historial de cancelaciones');
  }
};

export const mostrarBoleteria = async (req, res) => {
  try {
    const rolActual = req.session.usuario && req.session.usuario.rol;
    if (rolActual !== 'Administrador' && rolActual !== 'Supervisor') {
      return res.status(403).send('Acceso denegado.');
    }
    
    const eventos = await Evento.find(); 
    res.render('Admin/boleteria', { usuarioLogueado: req.session.usuario, eventos });
  } catch (error) {
    res.status(500).send('Error interno del servidor.');
  }
};

export const procesarVentaFisica = async (req, res) => {
  try {
    const rolActual = req.session.usuario && req.session.usuario.rol;
    if (rolActual !== 'Administrador' && rolActual !== 'Supervisor') {
      throw new Error('Acceso denegado.');
    }

    const cajeroActivo = req.session.usuario.nombreUsuario;
    const { dniCliente, nombreCliente, eventoId, tipoEntrada, cantidad, medioPago, precioUnitario } = req.body;
    
    let cliente = await Usuario.findOne({ dni: dniCliente });
    if (!cliente) {
      const passwordSegura = crypto.randomBytes(6).toString('hex');
      cliente = await Usuario.create({
        nombreUsuario: `cliente_${dniCliente}`,
        nombre: nombreCliente.split(' ')[0],
        apellido: 'Sucursal',            
        dni: dniCliente,
        rol: 'Cliente',
        email: `cajero_${cajeroActivo}_${dniCliente}@sucursal.com`, 
        password: passwordSegura,                   
        telefono: '0000000000',                 
        fechaNacimiento: new Date('1990-01-01') 
      });
    }

    const evento = await Evento.findById(eventoId);
    if (!evento) throw new Error('Evento no encontrado');
    
    const subtotal = parseFloat(precioUnitario) * parseInt(cantidad, 10);
    let descuentoAplicado = 0;
    let total = subtotal;

    if (medioPago === 'Efectivo') {
      descuentoAplicado = subtotal * 0.25; 
      total = subtotal - descuentoAplicado;
    }

    const nuevaVenta = await Transaccion.create({
      comprobanteId: `SUC-${Date.now().toString().slice(-6)}`,
      cliente: cliente._id,
      nombreCliente: `${cliente.nombre} ${cliente.apellido} (Cajero: ${cajeroActivo})`, 
      medioPago: medioPago,
      subtotal: subtotal,
      descuentoAplicado: descuentoAplicado, 
      total: total,                         
      canal: 'Sucursal',
      items: [{
        eventoId: evento._id,
        nombreEvento: evento.nombre,
        tipoEntrada: tipoEntrada,
        cantidad: parseInt(cantidad, 10),
        precio: parseFloat(precioUnitario)
      }]
    });

    res.render('Admin/imprimirTicket', { venta: nuevaVenta, cajero: cajeroActivo });
  } catch (error) {
    try {
      const eventos = await Evento.find();
      res.status(400).render('Admin/boleteria', { 
        usuarioLogueado: req.session.usuario, 
        eventos, 
        error: error.message,
        datosPrevios: req.body 
      });
    } catch (fetchError) {
      res.status(500).send('Ocurrió un error grave al intentar cargar la boletería.');
    }
  }
};