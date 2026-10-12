//const Entrada = require('../models/Entrada');

import Entrada from '../models/Entrada.js';

const getEntradas = async (req, res) => {
  try {
    // Si es un cliente, podemos filtrar sus compras/entradas por su ID de sesión
    const filtro = req.session.usuario && req.session.usuario.rol === 'Cliente' 
      ? { cliente: req.session.usuario.id } 
      : {};

    const entradas = await Entrada.find(filtro).populate('evento cliente');
    res.json(entradas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener entradas' });
  }
};

const getEntradaById = async (req, res) => {
  try {
    const entrada = await Entrada.findById(req.params.id).populate('evento cliente');
    if (!entrada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json(entrada);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar entrada' });
  }
};

const createEntrada = async (req, res) => {
  try {
    const { evento, cantidad, total } = req.body;
    const nuevaEntrada = new Entrada({
      cliente: req.session.usuario ? req.session.usuario.id : req.body.cliente,
      evento,
      cantidad: parseInt(cantidad) || 1,
      total: parseFloat(total) || 0
    });

    await nuevaEntrada.save();
    res.status(201).json(nuevaEntrada);
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar la compra' });
  }
};

const updateEntrada = async (req, res) => {
  try {
    const entradaActualizada = await Entrada.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entradaActualizada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json(entradaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar entrada' });
  }
};

const deleteEntrada = async (req, res) => {
  try {
    const entradaEliminada = await Entrada.findByIdAndDelete(req.params.id);
    if (!entradaEliminada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json({ message: 'Entrada eliminada', entrada: entradaEliminada });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar entrada' });
  }
};

export  {
  getEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada
};