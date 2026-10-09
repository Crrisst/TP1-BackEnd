// controllers/eventosController.js
const fs = require('fs');
const path = require('path');
const Evento = require('../models/Evento');

const rutaArchivo = path.join(__dirname, '../data/eventos.json');

const leerEventos = () => {
  try {
    if (!fs.existsSync(rutaArchivo)) {
      // Si no existe el archivo, lo creamos vacío por seguridad
      fs.writeFileSync(rutaArchivo, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(rutaArchivo, 'utf8');
    if (!data.trim()) return [];
    const objetos = JSON.parse(data);
    return objetos.map(e => new Evento(e.id, e.nombre, e.descripcion, e.fecha, e.hora, e.entradasDisponibles || 0));
  } catch (error) {
    console.error('Error al leer el archivo de eventos:', error);
    return [];
  }
};

const guardarEventos = (listaEventos) => {
  try {
    const datosParaGuardar = listaEventos.map(e => e.obtenerFichaPublica());
    fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al guardar el archivo de eventos:', error);
  }
};

const isHtmlRequest = (req) => {
  return (req.headers.accept && req.headers.accept.includes('text/html')) || 
         (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
};

const getEventos = (req, res) => {
  try {
    const eventos = leerEventos().map(e => e.obtenerFichaPublica());
    if (isHtmlRequest(req)) {
      return res.render('eventos', { eventos, error: req.query.error });
    }
    res.json(eventos);
  } catch (error) {
    console.error('Error en getEventos:', error);
    res.status(500).send('Error interno al cargar los eventos.');
  }
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
  const entradas = Number(entradasDisponibles);

  if (entradasDisponibles === undefined || entradasDisponibles === null || entradasDisponibles === "" || !Number.isInteger(entradas) || entradas < 0) {
    return res.status(400).json({ message: "Las entradas disponibles deben ser un número entero mayor o igual a cero." });
  }

  const nuevoEvento = new Evento(Date.now(), nombre, descripcion, fecha, hora, entradas);
  eventos.push(nuevoEvento);
  guardarEventos(eventos);

  if (isHtmlRequest(req)) {
    return res.redirect('/eventos');
  }
  res.status(201).json(nuevoEvento.obtenerFichaPublica());
};

const showEditEventoForm = (req, res) => {
  const eventos = leerEventos();
  const evento = eventos.find(e => e.id === parseInt(req.params.id));
  if (!evento) {
    return res.redirect('/eventos?error=Evento+no+encontrado');
  }
  res.render('editarEvento', { evento: evento.obtenerFichaPublica(), error: req.query.error });
};

const updateEvento = (req, res) => {
  const eventos = leerEventos();
  const evento = eventos.find(e => e.id === parseInt(req.params.id));
  if (!evento) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const { nombre, descripcion, fecha, hora, entradasDisponibles } = req.body;
  if (nombre) evento.nombre = nombre;
  if (descripcion) evento.descripcion = descripcion;
  if (fecha) evento.fecha = fecha;
  if (hora) evento.hora = hora;
  if (entradasDisponibles !== undefined) evento.setEntradasDisponibles(Number(entradasDisponibles));

  guardarEventos(eventos);

  if (isHtmlRequest(req)) {
    return res.redirect('/eventos');
  }
  res.json(evento.obtenerFichaPublica());
};

const deleteEvento = (req, res) => {
  const eventos = leerEventos();
  const index = eventos.findIndex(e => e.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Evento no encontrado' });
  }

  const [eventoEliminado] = eventos.splice(index, 1);
  guardarEventos(eventos);

  if (isHtmlRequest(req)) {
    return res.redirect('/eventos');
  }
  res.json(eventoEliminado.obtenerFichaPublica());
};

module.exports = {
  getEventos,
  getEventoById,
  createEvento,
  showEditEventoForm,
  updateEvento,
  deleteEvento
};