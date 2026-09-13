const fs = require('fs');
const path = require('path');
const Sala = require('../models/Sala');

const rutaArchivo = path.join(__dirname, '../data/salas.json');

const leerSalas = () => {
  if (!fs.existsSync(rutaArchivo)) return [];
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  if (!data) return [];
  const objetos = JSON.parse(data);
  return objetos.map(s => new Sala(s.id, s.nombre, s.descripcion, s.capacidad));
};

const guardarSalas = (listaSalas) => {
  const datosParaGuardar = listaSalas.map(s => s.obtenerInformacion());
  fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
};

const getSalas = (req, res) => {
  const salas = leerSalas();
  res.json(salas.map(s => s.obtenerInformacion()));
};

const getSalaById = (req, res) => {
  const salas = leerSalas();
  const sala = salas.find(s => s.id === parseInt(req.params.id));
  
  if (sala) {
    res.json(sala.obtenerInformacion());
  } else {
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

const createSala = (req, res) => {
  const salas = leerSalas();
  const { nombre, descripcion, capacidad } = req.body;
  
  //Validacion campos obligatorios
  if(!nombre || !descripcion || capacidad === undefined){
    return res.status(400).json({
      message: ' Todos los campos deben ser obligatorios.'
    })
  }
  //Valida la capacidad
  if(capacidad <=0){
    return res.status(400).json({
      message: 'La capacidad debe ser mayor a 0.'
    })
  }
  const nuevaSala = new Sala(Date.now(), nombre, descripcion, capacidad);
  salas.push(nuevaSala);
  guardarSalas(salas);
  
  res.status(201).json(nuevaSala.obtenerInformacion());
};

const updateSala = (req, res) => {
  const salas = leerSalas();
  const sala = salas.find(s => s.id === parseInt(req.params.id));
  
  if (sala) {
    const { nombre, descripcion, capacidad } = req.body;
    
    if (nombre) sala.nombre = nombre;
    if (descripcion) sala.descripcion = descripcion;
    if (capacidad !== undefined) sala.setCapacidad(capacidad);
    
    guardarSalas(salas);
    res.json(sala.obtenerInformacion());
  } else {
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

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