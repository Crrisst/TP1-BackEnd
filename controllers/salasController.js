const fs = require('fs');
const path = require('path');
const Sala = require('../models/Sala'); // Importación en PascalCase

const rutaArchivo = path.join(__dirname, '../data/salas.json');

// Leer las salas desde el archivo JSON e instanciar la clase Sala
const leerSalas = () => {
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  const objetos = JSON.parse(data);
  return objetos.map(s => new Sala(s.id, s.nombre, s.descripcion, s.capacidad));
};

// Guardar las salas en el archivo JSON
const guardarSalas = (listaSalas) => {
  const datosParaGuardar = listaSalas.map(s => s.obtenerInformacion());
  fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
};

// GET /salas - Obtener todas las salas
const getSalas = (req, res) => {
  const salas = leerSalas();
  res.json(salas.map(s => s.obtenerInformacion()));
};

// GET /salas/:id - Obtener sala por ID
const getSalaById = (req, res) => {
  const salas = leerSalas();
  const sala = salas.find(s => s.id === parseInt(req.params.id));
  
  if (sala) {
    res.json(sala.obtenerInformacion());
  } else {
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

// POST /salas - Crear sala
const createSala = (req, res) => {
  const salas = leerSalas();
  const { nombre, descripcion, capacidad } = req.body;
  
  const nuevaSala = new Sala(Date.now(), nombre, descripcion, capacidad);
  salas.push(nuevaSala);
  guardarSalas(salas);
  
  res.status(201).json(nuevaSala.obtenerInformacion());
};

// PUT /salas/:id - Actualizar sala
const updateSala = (req, res) => {
  const salas = leerSalas();
  const sala = salas.find(s => s.id === parseInt(req.params.id));
  
  if (sala) {
    const { nombre, descripcion, capacidad } = req.body;
    sala.nombre = nombre || sala.nombre;
    sala.descripcion = descripcion || sala.descripcion;
    if (capacidad !== undefined) sala.setCapacidad(capacidad);
    
    guardarSalas(salas);
    res.json(sala.obtenerInformacion());
  } else {
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

// DELETE /salas/:id - Eliminar sala
const deleteSala = (req, res) => {
  const salas = leerSalas();
  const salaIndex = salas.findIndex(s => s.id === parseInt(req.params.id));
  
  if (salaIndex !== -1) {
    const [salaEliminada] = salas.splice(salaIndex, 1);
    guardarSalas(salas);
    res.json({ message: 'Sala eliminada', sala: salaEliminada.obtenerInformacion() });
  } else {
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

module.exports = {
  getSalas,
  getSalaById,
  createSala,
  updateSala,
  deleteSala
};