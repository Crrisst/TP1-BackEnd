import Entrada from '../models/Entrada.js';

const getEntradas = async (req, res) => {
  try {
    // Verificación robusta del usuario logueado usando id o _id
    const usuarioLogueado = req.session && req.session.usuario;
    const usuarioId = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado._id) : null;

    const filtro = usuarioLogueado && usuarioLogueado.rol === 'Cliente' && usuarioId
      ? { cliente: usuarioId } 
      : {};

    const entradas = await Entrada.find(filtro).populate('evento cliente');
    res.json(entradas);
  } catch (error) {
    console.error('Error al obtener entradas:', error);
    res.status(500).json({ message: 'Error al obtener entradas' });
  }
};

const getEntradaById = async (req, res) => {
  try {
    const entrada = await Entrada.findById(req.params.id).populate('evento cliente');
    if (!entrada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json(entrada);
  } catch (error) {
    console.error('Error al buscar entrada por ID:', error);
    res.status(500).json({ message: 'Error al buscar entrada' });
  }
};

const createEntrada = async (req, res) => {
  try {
    const usuarioLogueado = req.session && req.session.usuario;
    const usuarioId = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado._id) : req.body.cliente;

    const { evento, cantidad, total } = req.body;
    const nuevaEntrada = new Entrada({
      cliente: usuarioId,
      evento,
      cantidad: parseInt(cantidad) || 1,
      total: parseFloat(total) || 0
    });

    await nuevaEntrada.save();
    res.status(201).json(nuevaEntrada);
  } catch (error) {
    console.error('Error al registrar la compra de entrada:', error);
    res.status(500).json({ message: 'Error al registrar la compra' });
  }
};

const updateEntrada = async (req, res) => {
  try {
    const entradaActualizada = await Entrada.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entradaActualizada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json(entradaActualizada);
  } catch (error) {
    console.error('Error al actualizar entrada:', error);
    res.status(500).json({ message: 'Error al actualizar entrada' });
  }
};

const deleteEntrada = async (req, res) => {
  try {
    const entradaEliminada = await Entrada.findByIdAndDelete(req.params.id);
    if (!entradaEliminada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json({ message: 'Entrada eliminada', entrada: entradaEliminada });
  } catch (error) {
    console.error('Error al eliminar entrada:', error);
    res.status(500).json({ message: 'Error al eliminar entrada' });
  }
};

export {
  getEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada
};