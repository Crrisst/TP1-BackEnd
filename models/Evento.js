//const mongoose = require('mongoose');
import mongoose from 'mongoose';

//const Sala = require('./Sala');
import Sala from './Sala.js';
const { ZONAS, obtenerZonas } = Sala;

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String },
  precio: { type: Number, required: true, default: 5000, min: [0, 'El precio no puede ser negativo'] },
  entradasDisponibles: { type: Number, default: 0, min: [0, 'La cantidad de entradas no puede ser negativa.'] },
  vendidosPorZona: { type: mongoose.Schema.Types.Mixed, default: undefined },
  sala: { type: mongoose.Schema.Types.ObjectId, ref: 'Sala' }
}, { timestamps: true });

eventoSchema.methods.venderEntradas = function(cantidad) {
  if (cantidad <= 0) {
    throw new Error('La cantidad a vender debe ser mayor a cero.');
  }
  if (cantidad > this.entradasDisponibles) {
    throw new Error('No hay suficientes entradas disponibles para este evento.');
  }
  this.entradasDisponibles -= cantidad;
  return true;
};

async function prepararStockZonas(eventoId) {
  let evento = await mongoose.model('Evento').findById(eventoId).populate('sala');
  if (!evento) throw Object.assign(new Error('Evento no encontrado.'), { status: 404 });
  if (!evento.vendidosPorZona) {
    const entradas = await mongoose.model('Entrada').find({ evento: eventoId });
    const vendidos = { General: 0, Platea: 0, VIP: 0 };
    for (const entrada of entradas) {
      const sector = entrada.sector === 'Platea Preferencial' ? 'Platea' : entrada.sector;
      vendidos[ZONAS.includes(sector) ? sector : 'General'] += entrada.cantidad;
    }
    await mongoose.model('Evento').updateOne({ _id: eventoId, vendidosPorZona: { $exists: false } }, { $set: { vendidosPorZona: vendidos } });
    evento = await mongoose.model('Evento').findById(eventoId).populate('sala');
  }
  return evento;
}

async function disponibilidadZonas(eventoId) {
  const evento = await prepararStockZonas(eventoId);
  const capacidades = evento.sala ? obtenerZonas(evento.sala) : null;
  const disponibles = Object.fromEntries(ZONAS.map(zona => [zona, capacidades
    ? Math.max(0, Math.min(evento.entradasDisponibles, capacidades[zona] - (evento.vendidosPorZona[zona] || 0)))
    : evento.entradasDisponibles]));
  return { evento, disponibles };
}

async function reservarZona(eventoId, zona, cantidad) {
  if (!ZONAS.includes(zona) || !Number.isSafeInteger(cantidad) || cantidad < 1) {
    throw Object.assign(new Error('Sector o cantidad inválidos.'), { status: 400 });
  }
  const { evento, disponibles } = await disponibilidadZonas(eventoId);
  if (cantidad > disponibles[zona]) throw Object.assign(new Error(`No hay cupo suficiente en ${zona} para ${evento.nombre}.`), { status: 400 });
  const filtro = { _id: eventoId, entradasDisponibles: { $gte: cantidad } };
  if (evento.sala) {
    filtro[`vendidosPorZona.${zona}`] = { $lte: obtenerZonas(evento.sala)[zona] - cantidad };
    filtro.$expr = { $lte: [ { $add: ZONAS.map(key => ({ $ifNull: [`$vendidosPorZona.${key}`, 0] })) }, evento.sala.capacidad - cantidad ] };
  }
  const reservado = await mongoose.model('Evento').findOneAndUpdate(filtro, {
    $inc: { entradasDisponibles: -cantidad, [`vendidosPorZona.${zona}`]: cantidad }
  }, { returnDocument: 'after' });
  if (!reservado) throw Object.assign(new Error('El cupo cambió. Revisá las entradas disponibles.'), { status: 400 });
  return reservado;
}

async function liberarZona(eventoId, zona, cantidad) {
  await mongoose.model('Evento').updateOne({ _id: eventoId }, {
    $inc: { entradasDisponibles: cantidad, [`vendidosPorZona.${zona}`]: -cantidad }
  });
}

async function validarCupoEvento(salaId, entradasDisponibles, eventoId) {
  if (!Number.isSafeInteger(entradasDisponibles) || entradasDisponibles < 0) {
    throw Object.assign(new Error('El stock debe ser un entero mayor o igual a 0.'), { status: 400 });
  }
  if (!salaId) return;
  const sala = await Sala.findById(salaId);
  if (!sala) throw Object.assign(new Error('Sala no encontrada.'), { status: 400 });
  let vendidos = 0;
  if (eventoId) {
    const evento = await prepararStockZonas(eventoId);
    vendidos = ZONAS.reduce((sum, zona) => sum + (evento.vendidosPorZona[zona] || 0), 0);
    if (vendidos && String(evento.sala?._id) !== String(salaId)) {
      throw Object.assign(new Error('No se puede cambiar la sala de un evento con entradas vendidas.'), { status: 409 });
    }
  }
  if (entradasDisponibles + vendidos > sala.capacidad) {
    throw Object.assign(new Error('El stock disponible más las entradas vendidas supera la capacidad de la sala.'), { status: 400 });
  }
}


eventoSchema.statics.prepararStockZonas = prepararStockZonas;
eventoSchema.statics.disponibilidadZonas = disponibilidadZonas;
eventoSchema.statics.reservarZona = reservarZona;
eventoSchema.statics.liberarZona = liberarZona;
eventoSchema.statics.validarCupoEvento = validarCupoEvento;

//module.exports = mongoose.model('Evento', eventoSchema);

export default mongoose.model('Evento', eventoSchema);
