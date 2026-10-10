const Sala = require('../models/Sala');
const { obtenerZonas } = Sala;

const isHtmlRequest = req => !req.esApiSalas && Boolean(
  req.headers.accept?.includes('text/html') || req.headers['content-type']?.includes('application/x-www-form-urlencoded')
);
const serializar = (req, sala) => req.esApiSalas ? {
  _id: sala._id, name: sala.nombre, capacity: sala.capacidad, zones: obtenerZonas(sala),
  type: sala.tipo, isAvailable: sala.disponible, createdAt: sala.createdAt, updatedAt: sala.updatedAt
} : sala;
const noEncontrada = () => Object.assign(new Error('Sala no encontrada.'), { status: 404 });

const getSalas = async (req, res, next) => {
  try {
    const resultado = await Sala.find();
    if (isHtmlRequest(req)) return res.render('salas', { salas: resultado.map(sala => ({ ...sala.toObject(), id: sala.id, zonas: obtenerZonas(sala) })), usuarioLogueado: req.session?.usuario });
    res.json(resultado.map(sala => serializar(req, sala)));
  } catch (error) { next(error); }
};
const getSalaById = async (req, res, next) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) throw noEncontrada();
    res.json(serializar(req, sala));
  } catch (error) { next(error); }
};
const createSala = async (req, res, next) => {
  try {
    const sala = await Sala.create(req.salaDatos);
    if (isHtmlRequest(req)) return res.redirect('/salas');
    res.status(201).json(serializar(req, sala));
  } catch (error) { next(error); }
};
const updateSala = async (req, res, next) => {
  try {
    const sala = await Sala.actualizarConZonas(req.params.id, req.salaDatos);
    if (!sala) throw noEncontrada();
    if (isHtmlRequest(req)) return res.redirect('/salas');
    res.json(serializar(req, sala));
  } catch (error) { next(error); }
};
const deleteSala = async (req, res, next) => {
  try {
    const sala = await Sala.eliminarConEventos(req.params.id);
    if (!sala) throw noEncontrada();
    if (isHtmlRequest(req)) return res.redirect('/salas');
    res.json({ message: 'Sala eliminada exitosamente.' });
  } catch (error) { next(error); }
};
const showEditSalaForm = async (req, res, next) => {
  try {
    const sala = await Sala.findById(req.params.id);
    if (!sala) throw noEncontrada();
    res.render('editarSala', { sala: { ...sala.toObject(), id: sala.id, zonas: obtenerZonas(sala) }, usuarioLogueado: req.session?.usuario, error: req.query.error });
  } catch (error) { next(error); }
};
module.exports = { getSalas, getSalaById, createSala, updateSala, deleteSala, showEditSalaForm };
