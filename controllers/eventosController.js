const fs = require('fs');
const path = require('path');
const Evento = require('../models/Evento'); // Importación en PascalCase

const rutaArchivo = path.join(__dirname, '../data/eventos.json');

// Leer los eventos desde el archivo JSON y re-instanciar la clase Evento
const leerEventos = () => {
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  const objetos = JSON.parse(data);
  return objetos.map(e => new Evento(e.id, e.nombre, e.descripcion, e.fecha, e.hora, e.entradasDisponibles || 0));
};

// Guardar los eventos en el archivo JSON
const guardarEventos = (listaEventos) => {
  const datosParaGuardar = listaEventos.map(e => e.obtenerFichaPublica());
  fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
};

// GET /eventos - Obtener todos los eventos
const getEventos = (req, res) => {
  const eventos = leerEventos();
  res.json(eventos.map(e => e.obtenerFichaPublica()));
};

// GET /eventos/:id - Obtener evento por ID
const getEventoById = (req, res) => {
  const eventos = leerEventos();
  const evento = eventos.find(e => e.id === parseInt(req.params.id));
  
  if (evento) {
    res.json(evento.obtenerFichaPublica());
  } else {
    res.status(404).json({ message: 'Evento no encontrado' });
  }
};

// POST /eventos - Crear evento
const createEvento = (req, res) => {
  const eventos = leerEventos();
  const { nombre, descripcion, fecha, hora, entradasDisponibles } = req.body;
  
  const nuevoEvento = new Evento(Date.now(), nombre, descripcion, fecha, hora, entradasDisponibles);
  eventos.push(nuevoEvento);
  guardarEventos(eventos);
  
  res.status(201).json(nuevoEvento.obtenerFichaPublica());
};

// PUT /eventos/:id - Actualizar evento
const updateEvento = (req, res) => {
  const eventos = leerEventos();
  const evento = eventos.find(e => e.id === parseInt(req.params.id));
  
  if (evento) {
    const { nombre, descripcion, fecha, hora } = req.body;
    evento.nombre = nombre || evento.nombre;
    evento.descripcion = descripcion || evento.descripcion;
    evento.fecha = fecha || evento.fecha;
    evento.hora = hora || evento.hora;
    
    guardarEventos(eventos);
    res.json(evento.obtenerFichaPublica());
  } else {
    res.status(404).json({ message: 'Evento no encontrado' });
  }
};

// DELETE /eventos/:id - Eliminar evento
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