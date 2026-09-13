const fs = require('fs');
const path = require('path');

// Carga segura del modelo Entrada
const modeloImportado = require('../models/Entrada');
const Entrada = typeof modeloImportado === 'function' ? modeloImportado : modeloImportado.Entrada;

const rutaArchivo = path.join(__dirname, '../data/entradas.json');

const leerEntradas = () => {
  if (!fs.existsSync(rutaArchivo)) return [];
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  if (!data) return [];
  const objetos = JSON.parse(data);
  return objetos.map(e => new Entrada(e.id, e.nombre, e.descripcion, e.precio, e.cantidad));
};

const guardarEntradas = (listaEntradas) => {
  const datosParaGuardar = listaEntradas.map(e => e.obtenerDetalle());
  fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
};

const getEntradas = (req, res) => {
  const entradas = leerEntradas();
  res.json(entradas.map(e => e.obtenerDetalle()));
};

const getEntradaById = (req, res) => {
  const entradas = leerEntradas();
  const entrada = entradas.find(e => e.id === parseInt(req.params.id));
  
  if (!entrada) {
    return res.status(404).json({ message: 'Entrada no encontrada' });
  }
  
  res.json(entrada.obtenerDetalle());
};

const createEntrada = (req, res) => {
  const entradas = leerEntradas();
  const { nombre, descripcion, precio, cantidad } = req.body;

  const nuevaEntrada = new Entrada(Date.now(), nombre, descripcion, precio, cantidad);
  entradas.push(nuevaEntrada);
  guardarEntradas(entradas);

  res.status(201).json(nuevaEntrada.obtenerDetalle());
};

const updateEntrada = (req, res) => {
  const entradas = leerEntradas();
  const entrada = entradas.find(e => e.id === parseInt(req.params.id));

  if (!entrada) {
    return res.status(404).json({ message: 'Entrada no encontrada' });
  }

  const { nombre, descripcion, precio, cantidad } = req.body;

  if (nombre) entrada.nombre = nombre;
  if (descripcion) entrada.descripcion = descripcion;
  if (precio !== undefined) entrada.setPrecio(precio);
  if (cantidad !== undefined) entrada.actualizarCantidad(cantidad);

  guardarEntradas(entradas);
  res.json(entrada.obtenerDetalle());
};

const deleteEntrada = (req, res) => {
  const entradas = leerEntradas();
  const index = entradas.findIndex(e => e.id === parseInt(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Entrada no encontrada' });
  }

  const [entradaEliminada] = entradas.splice(index, 1);
  guardarEntradas(entradas);

  res.json(entradaEliminada.obtenerDetalle());
};

module.exports = {
  getEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada
};