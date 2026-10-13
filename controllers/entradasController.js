import Entrada from '../models/Entrada.js';
import Transaccion from '../models/Transaccion.js';
import Evento from '../models/Evento.js';

export const mostrarGestionEntradas = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let matchFiltro = {};
    if (fechaInicio) matchFiltro.fechaCompra = { $gte: new Date(fechaInicio + 'T00:00:00') };
    if (fechaFin) matchFiltro.fechaCompra = { ...matchFiltro.fechaCompra, $lte: new Date(fechaFin + 'T23:59:59.999') };

    const inicioHoy = new Date(); 
    inicioHoy.setHours(0, 0, 0, 0);

    const statsHoy = await Transaccion.aggregate([
      { $match: { fechaCompra: { $gte: inicioHoy } } },
      { $unwind: "$items" },
      { $group: { _id: null, totalTx: { $addToSet: "$_id" }, vendidas: { $sum: "$items.cantidad" }, recaudado: { $sum: { $multiply: ["$items.cantidad", "$items.precio"] } } } }
    ]);

    // Usamos el filtro de fechas (si existe) para la agregación histórica
    const etapasAgregacion = [];
    if (Object.keys(matchFiltro).length > 0) {
      etapasAgregacion.push({ $match: matchFiltro });
    }
    etapasAgregacion.push(
      { $unwind: "$items" },
      { $group: { _id: "$items.eventoId", vendidas: { $sum: "$items.cantidad" }, recaudado: { $sum: { $multiply: ["$items.cantidad", "$items.precio"] } } } }
    );

    const statsFiltro = await Transaccion.aggregate(etapasAgregacion);
    const totalTransaccionesFiltro = await Transaccion.countDocuments(matchFiltro);

    const eventosBD = await Evento.find().populate('sala').lean();
    let totalV = 0, totalR = 0;

    const eventos = eventosBD.map(ev => {
      const stats = statsFiltro.find(s => s._id.toString() === ev._id.toString()) || { vendidas: 0, recaudado: 0 };
      totalV += stats.vendidas; totalR += stats.recaudado;
      const cupo = Number(ev.entradasDisponibles || 0);
      return {
        id: ev._id, nombre: ev.nombre, sala: ev.sala?.nombre || 'Sin sala',
        cupo, vendidas: stats.vendidas, disponibles: Math.max(0, cupo - stats.vendidas),
        recaudado: Math.round(stats.recaudado), porcentaje: cupo > 0 ? Math.round((stats.vendidas/cupo)*100) : 0
      };
    });

    res.render('Admin/entradas', {
      usuarioLogueado: req.session.usuario,
      resumenHoy: statsHoy[0] ? { totalTransacciones: statsHoy[0].totalTx.length, totalVendidas: statsHoy[0].vendidas, totalRecaudado: statsHoy[0].recaudado } : { totalTransacciones: 0, totalVendidas: 0, totalRecaudado: 0 },
      resumen: { totalTransacciones: totalTransaccionesFiltro, totalVendidas: totalV, totalRecaudado: totalR },
      eventos,
      filtrosApli: { fechaInicio, fechaFin }
    });
  } catch (error) { 
    res.status(500).render('Admin/dashboard', { error: 'Error al consultar transacciones: ' + error.message });
  }
};

export const getEntradas = async (req, res) => res.json(await Entrada.find(req.session.usuario.rol === 'Cliente' ? { cliente: req.session.usuario._id } : {}).populate('evento cliente'));
export const getEntradaById = async (req, res) => res.json(await Entrada.findById(req.params.id));
export const createEntrada = async (req, res) => res.status(201).json(await Entrada.create({ ...req.body, cliente: req.session.usuario._id }));
export const updateEntrada = async (req, res) => res.json(await Entrada.findByIdAndUpdate(req.params.id, req.body, { new: true }));
export const deleteEntrada = async (req, res) => res.json(await Entrada.findByIdAndDelete(req.params.id));