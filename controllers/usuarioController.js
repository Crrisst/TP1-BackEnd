const fs = require('fs');
const path = require('path');
const Cliente = require('../models/Cliente');
const Administrador = require('../models/Administrador');

const rutaArchivo = path.join(__dirname, '../data/usuarios.json');

const leerUsuarios = () => {
  if (!fs.existsSync(rutaArchivo)) return [];
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  if (!data) return [];
  
  const objetos = JSON.parse(data);

  return objetos.map(u => {
    if (u.nivelAcceso || u.rol === 'Administrador') {
      return new Administrador(u.id, u.nombreUsuario, u.nombre, u.apellido, u.email, u.password, u.dni, u.fechaNacimiento, u.telefono, u.nivelAcceso);
    }
    const cliente = new Cliente(u.id, u.nombreUsuario, u.nombre, u.apellido, u.email, u.password, u.dni, u.fechaNacimiento, u.telefono, u.tipo, u.porcentajeDescuento);
    if (Array.isArray(u.historialEntradas)) {
      u.historialEntradas.forEach(e => cliente.agregarEntrada(e));
    }
    return cliente;
  });
};

const guardarUsuarios = (usuarios) => {
  const datosParaGuardar = usuarios.map(u => u.obtenerPerfil());
  fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
};

const getUsuarios = (req, res) => {
  const usuarios = leerUsuarios();
  const mensajeError = req.query.error; 
  res.render('usuarios', { 
    usuarios: usuarios.map(u => u.obtenerPerfil()),
    error: mensajeError
  });
};

const getUsuarioById = (req, res) => {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.getId() === parseInt(req.params.id));
  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.json(usuario.obtenerPerfil());
};

const createUsuario = (req, res) => {
  const usuarios = leerUsuarios();
  const { nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, rol, tipo, porcentajeDescuento, nivelAcceso } = req.body;
  const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.getId())) + 1 : 1;
  
  let nuevoUsuario;
  if ((rol && rol.toUpperCase() === 'ADMINISTRADOR') || nivelAcceso) {
    nuevoUsuario = new Administrador(nuevoId, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, nivelAcceso || 'MODERADOR');
  } else {
    nuevoUsuario = new Cliente(nuevoId, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, tipo || 'ESTANDAR', porcentajeDescuento || 0);
  }

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);
  res.redirect('/usuarios');
};

// NUEVA FUNCIÓN: Muestra el formulario con los datos precargados
const showEditUsuarioForm = (req, res) => {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.getId() === parseInt(req.params.id));
  
  if (!usuario) {
    return res.redirect('/usuarios?error=Usuario+no+encontrado');
  }
  
  res.render('editarUsuario', {
    usuario: usuario.obtenerPerfil(),
    error: req.query.error
  });
};

// MODIFICADA: Ahora recrea el objeto (por si cambia de rol) y redirige
const updateUsuario = (req, res) => {
  const usuarios = leerUsuarios();
  const id = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.getId() === id);

  if (index === -1) {
    return res.redirect('/usuarios?error=Usuario+no+encontrado');
  }

  const usuarioAntiguo = usuarios[index];
  const { nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, rol, tipo, porcentajeDescuento, nivelAcceso } = req.body;

  let usuarioActualizado;
  
  // Evaluamos si el nuevo rol es administrador
  if ((rol && rol.toUpperCase() === 'ADMINISTRADOR') || nivelAcceso) {
    usuarioActualizado = new Administrador(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, nivelAcceso || 'MODERADOR');
  } else {
    usuarioActualizado = new Cliente(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, tipo || 'ESTANDAR', porcentajeDescuento || 0);
    
    // Si era cliente antes, le conservamos su historial de entradas
    if (usuarioAntiguo instanceof Cliente) {
      usuarioAntiguo.getHistorialEntradas().forEach(e => usuarioActualizado.agregarEntrada(e));
    }
  }

  // Reemplazamos el viejo por el nuevo en el arreglo
  usuarios[index] = usuarioActualizado;
  guardarUsuarios(usuarios);
  
  // Redirigimos a la tabla principal
  res.redirect('/usuarios');
};

const deleteUsuario = (req, res) => {
  const usuarios = leerUsuarios();
  const idAEliminar = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.getId() === idAEliminar);

  if (index === -1) {
    return res.status(404).send('Usuario no encontrado');
  }

  usuarios.splice(index, 1);
  guardarUsuarios(usuarios);
  res.redirect('/usuarios');
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  showEditUsuarioForm // No te olvides de exportarla
};