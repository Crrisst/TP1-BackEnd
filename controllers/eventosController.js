const Sala = require('../models/Sala');
const { validarCupoEvento } = require('../models/Evento');
const Evento = require('../models/Evento');

const isHtmlRequest = (req) => {
  return (req.headers.accept && req.headers.accept.includes('text/html')) || 
         (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
};

const getEventos = async (req, res) => {
  try {
    const eventos = await Evento.find().populate('sala');
    if (isHtmlRequest(req)) {
      return res.render('eventos', { eventos, salas: await Sala.find(), error: req.query.error });
    }
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).send('Error interno al cargar los eventos.');
  }
};

const getEventoById = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id).populate('sala');
    if (!evento) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el evento' });
  }
};

const createEvento = async (req, res) => {
  try {
    const { nombre, descripcion, fecha, hora, precio, entradasDisponibles, sala } = req.body;
    const entradas = Number(entradasDisponibles);

    if (entradasDisponibles === undefined || isNaN(entradas) || entradas < 0) {
      if (isHtmlRequest(req)) return res.redirect('/eventos?error=Entradas+inválidas');
      return res.status(400).json({ message: 'Las entradas disponibles deben ser un número >= 0.' });
    }

    await validarCupoEvento(sala, entradas);
    const nuevoEvento = new Evento({
      nombre,
      descripcion,
      fecha,
      hora,
      precio: parseFloat(precio) || 5000,
      entradasDisponibles: entradas,
      sala: sala || null
    });

    await nuevoEvento.save();

    if (isHtmlRequest(req)) {
      return res.redirect('/eventos');
    }
    res.status(201).json(nuevoEvento);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Error interno al crear el evento' });
  }
};

const showEditEventoForm = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.redirect('/eventos?error=Evento+no+encontrado');
    }
    res.render('editarEvento', { evento, salas: await Sala.find(), error: req.query.error });
  } catch (error) {
    res.redirect('/eventos?error=Error+al+cargar+el+evento');
  }
};

const updateEvento = async (req, res) => {
  try {
    const { nombre, descripcion, fecha, hora, precio, entradasDisponibles, sala } = req.body;
    const updateData = {};

    if (nombre) updateData.nombre = nombre;
    if (descripcion) updateData.descripcion = descripcion;
    if (fecha) updateData.fecha = fecha;
    if (hora) updateData.hora = hora;
    if (precio !== undefined) updateData.precio = parseFloat(precio);
    if (entradasDisponibles !== undefined) updateData.entradasDisponibles = Number(entradasDisponibles);
    if (sala) updateData.sala = sala;

    const actual = await Evento.findById(req.params.id);
    if (!actual) return res.status(404).json({ message: 'Evento no encontrado' });
    await validarCupoEvento(sala || actual.sala, updateData.entradasDisponibles ?? actual.entradasDisponibles, actual._id);

    const eventoActualizado = await Evento.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!eventoActualizado) {
      if (isHtmlRequest(req)) return res.redirect('/eventos?error=Evento+no+encontrado');
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (isHtmlRequest(req)) {
      return res.redirect('/eventos');
    }
    res.json(eventoActualizado);
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Error al actualizar el evento' });
  }
};

const deleteEvento = async (req, res) => {
  try {
    const eventoEliminado = await Evento.findByIdAndDelete(req.params.id);
    if (!eventoEliminado) {
      if (isHtmlRequest(req)) return res.redirect('/eventos?error=Evento+no+encontrado');
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (isHtmlRequest(req)) {
      return res.redirect('/eventos');
    }
    res.json({ message: 'Evento eliminado correctamente', evento: eventoEliminado });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el evento' });
  }
};

module.exports = {
  getEventos,
  getEventoById,
  createEvento,
  showEditEventoForm,
  updateEvento,
  deleteEvento
};