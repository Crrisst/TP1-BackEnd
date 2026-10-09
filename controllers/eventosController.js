const Evento = require('../models/Evento');

const isHtmlRequest = (req) => {
  return (req.headers.accept && req.headers.accept.includes('text/html')) ||
         (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
};

const getEventos = async (req, res) => {
  try {
    const eventos = await Evento.find().populate('sala');
    if (isHtmlRequest(req)) {
      return res.render('eventos', { eventos, usuarioLogueado: req.session.usuario });
    }
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener eventos' });
  }
};

const getEventoById = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id).populate('sala');
    if (!evento) return res.status(404).json({ message: 'Evento no encontrado' });
    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el evento' });
  }
};

const createEvento = async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora, entradasDisponibles, sala } = req.body;
    const nuevoEvento = new Evento({
      titulo,
      descripcion,
      fecha,
      hora,
      entradasDisponibles: parseInt(entradasDisponibles) || 0,
      sala: sala || null
    });

    await nuevoEvento.save();
    if (isHtmlRequest(req)) return res.redirect('/eventos');
    res.status(201).json(nuevoEvento);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear evento' });
  }
};

const updateEvento = async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora, entradasDisponibles, sala } = req.body;
    const updateData = {};
    if (titulo) updateData.titulo = titulo;
    if (descripcion) updateData.descripcion = descripcion;
    if (fecha) updateData.fecha = fecha;
    if (hora) updateData.hora = hora;
    if (entradasDisponibles !== undefined) updateData.entradasDisponibles = parseInt(entradasDisponibles);
    if (sala) updateData.sala = sala;

    const eventoActualizado = await Evento.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!eventoActualizado) {
      if (isHtmlRequest(req)) return res.redirect('/eventos?error=No+encontrado');
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (isHtmlRequest(req)) return res.redirect('/eventos');
    res.json(eventoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar evento' });
  }
};

const deleteEvento = async (req, res) => {
  try {
    const eventoEliminado = await Evento.findByIdAndDelete(req.params.id);
    if (!eventoEliminado) {
      if (isHtmlRequest(req)) return res.redirect('/eventos?error=No+encontrado');
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    if (isHtmlRequest(req)) return res.redirect('/eventos');
    res.json({ message: 'Evento eliminado', evento: eventoEliminado });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar evento' });
  }
};

const showEditEventoForm = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) return res.redirect('/eventos?error=No+encontrado');

    res.render('editarEvento', { evento, usuarioLogueado: req.session.usuario, error: req.query.error });
  } catch (error) {
    res.redirect('/eventos?error=Error');
  }
};

module.exports = {
  getEventos,
  getEventoById,
  createEvento,
  updateEvento,
  deleteEvento,
  showEditEventoForm
};