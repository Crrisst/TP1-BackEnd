import Sala from '../models/Sala.js';
import Evento from '../models/Evento.js';

const isHtmlRequest = (req) => {
  return (req.headers.accept && req.headers.accept.includes('text/html')) || 
         (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
};

const getSalas = async (req, res) => {
  try {
    const salas = await Sala.find();
    if (isHtmlRequest(req)) {
      return res.render('salas', { 
        usuarioLogueado: req.session ? req.session.usuario : null, // 👈 Enviamos la sesión activa
        salas,
        error: req.query.error || null,
        exito: req.query.exito || null
      });
    }
    res.json(salas);
  } catch (error) {
    console.error('Error al obtener salas:', error);
    res.status(500).send('Error interno al cargar las salas.');
  }
};

const getSalaById = async (req, res) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) return res.status(404).json({ message: 'Sala no encontrada' });
    res.json(sala);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la sala' });
  }
};

const createSala = async (req, res) => {
  try {
    const { nombre, descripcion, capacidad, general, platea, vip, ubicacion } = req.body;
    
    const zonas = {
      General: Number(general) || 0,
      Platea: Number(platea) || 0,
      VIP: Number(vip) || 0
    };

    const nuevaSala = new Sala({
      nombre,
      descripcion,
      capacidad: Number(capacidad),
      zonas,
      ubicacion
    });

    await nuevaSala.save();

    if (isHtmlRequest(req)) return res.redirect('/salas?exito=Sala+creada+correctamente');
    res.status(201).json(nuevaSala);
  } catch (error) {
    console.error('Error al crear sala:', error);
    if (isHtmlRequest(req)) return res.redirect(`/salas?error=${encodeURIComponent(error.message)}`);
    res.status(400).json({ message: error.message });
  }
};

const showEditSalaForm = async (req, res) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) return res.redirect('/salas?error=Sala+no+encontrada');
    res.render('editarSala', { 
      usuarioLogueado: req.session ? req.session.usuario : null, // 👈 Enviamos la sesión activa
      sala,
      error: req.query.error || null 
    });
  } catch (error) {
    res.redirect('/salas?error=Error+al+cargar+la+sala');
  }
};

const updateSala = async (req, res) => {
  try {
    const { nombre, descripcion, capacidad, general, platea, vip, ubicacion } = req.body;
    
    const zonas = {
      General: Number(general) || 0,
      Platea: Number(platea) || 0,
      VIP: Number(vip) || 0
    };

    const salaActualizada = await Sala.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion, capacidad: Number(capacidad), zonas, ubicacion },
      { new: true, runValidators: true }
    );

    if (!salaActualizada) {
      if (isHtmlRequest(req)) return res.redirect('/salas?error=Sala+no+encontrada');
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    if (isHtmlRequest(req)) return res.redirect('/salas?exito=Sala+actualizada+correctamente');
    res.json(salaActualizada);
  } catch (error) {
    console.error('Error al actualizar sala:', error);
    if (isHtmlRequest(req)) return res.redirect(`/salas?error=${encodeURIComponent(error.message)}`);
    res.status(400).json({ message: error.message });
  }
};

const deleteSala = async (req, res) => {
  try {
    const tieneEventos = await Evento.exists({ sala: req.params.id });
    if (tieneEventos) {
      if (isHtmlRequest(req)) return res.redirect('/salas?error=No+se+puede+eliminar+una+sala+con+eventos+asociados');
      return res.status(400).json({ message: 'No se puede eliminar una sala con eventos asociados' });
    }

    const salaEliminada = await Sala.findByIdAndDelete(req.params.id);
    if (!salaEliminada) {
      if (isHtmlRequest(req)) return res.redirect('/salas?error=Sala+no+encontrada');
      return res.status(404).json({ message: 'Sala no encontrada' });
    }

    if (isHtmlRequest(req)) return res.redirect('/salas?exito=Sala+eliminada+correctamente');
    res.json({ message: 'Sala eliminada correctamente', sala: salaEliminada });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la sala' });
  }
};

export {
  getSalas,
  getSalaById,
  createSala,
  showEditSalaForm,
  updateSala,
  deleteSala
};