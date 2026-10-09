const Sala = require('../models/Sala');

const isHtmlRequest = (req) => {
  return (req.headers.accept && req.headers.accept.includes('text/html')) ||
         (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
};

const getSalas = async (req, res) => {
  try {
    const salas = await Sala.find();
    if (isHtmlRequest(req)) {
      return res.render('salas', { salas, usuarioLogueado: req.session.usuario });
    }
    res.json(salas);
  } catch (error) {
    console.error('Error al obtener salas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getSalaById = async (req, res) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) return res.status(404).json({ message: 'Sala no encontrada' });
    res.json(sala);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar la sala' });
  }
};

const createSala = async (req, res) => {
  try {
    const { nombre, descripcion, capacidad } = req.body;
    const capNum = parseInt(capacidad);

    if (!nombre || !descripcion || capacidad === undefined || isNaN(capNum) || capNum <= 0) {
      if (isHtmlRequest(req)) return res.redirect('/salas?error=Datos+inválidos');
      return res.status(400).json({ message: 'Datos inválidos o capacidad menor a 0.' });
    }

    const nuevaSala = new Sala({ nombre, descripcion, capacidad: capNum });
    await nuevaSala.save();

    if (isHtmlRequest(req)) return res.redirect('/salas');
    res.status(201).json(nuevaSala);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la sala' });
  }
};

const updateSala = async (req, res) => {
  try {
    const { nombre, descripcion, capacidad } = req.body;
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (descripcion) updateData.descripcion = descripcion;
    if (capacidad !== undefined) updateData.capacidad = parseInt(capacidad);

    const salaActualizada = await Sala.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!salaActualizada) {
      if (isHtmlRequest(req)) return res.redirect('/salas?error=Sala+no+encontrada');
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    if (isHtmlRequest(req)) return res.redirect('/salas');
    res.json(salaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la sala' });
  }
};

const deleteSala = async (req, res) => {
  try {
    const salaEliminada = await Sala.findByIdAndDelete(req.params.id);
    if (!salaEliminada) {
      if (isHtmlRequest(req)) return res.redirect('/salas?error=Sala+no+encontrada');
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    if (isHtmlRequest(req)) return res.redirect('/salas');
    res.json({ message: 'Sala eliminada', sala: salaEliminada });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la sala' });
  }
};

const showEditSalaForm = async (req, res) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) return res.redirect('/salas?error=Sala+no+encontrada');

    res.render('editarSala', { sala, usuarioLogueado: req.session.usuario, error: req.query.error });
  } catch (error) {
    res.redirect('/salas?error=Error+al+cargar+sala');
  }
};

module.exports = {
  getSalas,
  getSalaById,
  createSala,
  updateSala,
  deleteSala,
  showEditSalaForm
};