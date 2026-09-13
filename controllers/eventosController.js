const fs = require('fs');
const path = require('path');
const Evento = require('../models/Evento');

const rutaArchivo = path.join(__dirname, '../data/eventos.json');

const leerEventos = () => {
  if (!fs.existsSync(rutaArchivo)) return [];
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  if (!data) return [];
  const objetos = JSON.parse(data);
  return objetos.map(e => new Evento(e.id, e.nombre, e.descripcion, e.fecha, e.hora, e.entradasDisponibles || 0));
};

const guardarEventos = (listaEventos) => {
  const datosParaGuardar = listaEventos.map(e => e.obtenerFichaPublica());
  fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
};

const getEventos = (req, res) => {
  const eventos = leerEventos();
  res.json(eventos.map(e => e.obtenerFichaPublica()));
};

const getEventoById = (req, res) => {
  const eventos = leerEventos();
  const evento = eventos.find(e => e.id === parseInt(req.params.id));
  
  if (evento) {
    res.json(evento.obtenerFichaPublica());
  } else {
    res.status(404).json({ message: 'Evento no encontrado' });
  }
};

const createEvento = (req, res) => {
  const eventos = leerEventos();
  const { nombre, descripcion, fecha, hora, entradasDisponibles } = req.body;
  
  const nuevoEvento = new Evento(Date.now(), nombre, descripcion, fecha, hora, entradasDisponibles);
  eventos.push(nuevoEvento);
  guardarEventos(eventos);
  
  res.status(201).json(nuevoEvento.obtenerFichaPublica());
};

const updateEvento = (req, res) => {
  const eventos = leerEventos();
  const evento = eventos.find(e => e.id === parseInt(req.params.id));
  
  if (evento) {
    const { nombre, descripcion, fecha, hora, entradasDisponibles } = req.body;
    
    if (nombre) evento.nombre = nombre;
    if (descripcion) evento.descripcion = descripcion;
    if (fecha) evento.fecha = fecha;
    if (hora) evento.hora = hora;
    if (entradasDisponibles !== undefined) evento.setEntradasDisponibles(entradasDisponibles);
    
    guardarEventos(eventos);
    res.json(evento.obtenerFichaPublica());
  } else {
    res.status(404).json({ message: 'Evento no encontrado' });
  }
};

const deleteEvento = (req, res) => {
  const eventos = leerEventos();
  const index = eventos.findIndex(e => e.id === parseInt(req.params.id));
  
  if (index !== -1) {
    const [eventoEliminado] = eventos.splice(index, 1);
    guardarEventos(eventos);
    res.json({ message: 'Evento eliminado', evento: eventoEliminado.obtenerFichaPublica() });
  } else {
    res.status(404).json({ message: 'Evento no encontrado' });
  }
};

module.exports = {
  getEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento
};