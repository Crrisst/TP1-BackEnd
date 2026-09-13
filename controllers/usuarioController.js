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
      return new Administrador(u.id, u.nombre, u.email, u.password, u.nivelAcceso);
    }
    const cliente = new Cliente(u.id, u.nombre, u.email, u.password, u.tipo, u.porcentajeDescuento);
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
  res.json(usuarios.map(u => u.obtenerPerfil()));
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
  const { nombre, email, password, rol, tipo, porcentajeDescuento, nivelAcceso } = req.body;

  let nuevoUsuario;
  if (rol === 'Administrador' || nivelAcceso) {
    nuevoUsuario = new Administrador(Date.now(), nombre, email, password, nivelAcceso || 'MODERADOR');
  } else {
    nuevoUsuario = new Cliente(Date.now(), nombre, email, password, tipo || 'ESTANDAR', porcentajeDescuento || 0);
  }

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  res.status(201).json(nuevoUsuario.obtenerPerfil());
};

const updateUsuario = (req, res) => {
  const usuarios = leerUsuarios();
  const usuario = usuarios.find(u => u.getId() === parseInt(req.params.id));

  if (!usuario) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const { nombre, email, password, tipo, porcentajeDescuento, nivelAcceso } = req.body;

  if (nombre) usuario.setNombre(nombre);
  if (email) usuario.setEmail(email);
  if (password) usuario.setPassword(password);

  if (usuario instanceof Cliente) {
    if (tipo) usuario.setTipo(tipo);
    if (porcentajeDescuento !== undefined) usuario.setPorcentajeDescuento(porcentajeDescuento);
  } else if (usuario instanceof Administrador) {
    if (nivelAcceso) usuario.setNivelAcceso(nivelAcceso);
  }

  guardarUsuarios(usuarios);
  res.json(usuario.obtenerPerfil());
};

const deleteUsuario = (req, res) => {
  const usuarios = leerUsuarios();
  const index = usuarios.findIndex(u => u.getId() === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const [usuarioEliminado] = usuarios.splice(index, 1);
  guardarUsuarios(usuarios);

  res.json(usuarioEliminado.obtenerPerfil());
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
};