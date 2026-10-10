const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  fecha: { type: Date, required: true },
  hora: { type: String },
  precio: { type: Number, required: true, default: 5000, min: [0, 'El precio no puede ser negativo'] },
  entradasDisponibles: { type: Number, default: 0, min: [0, 'La cantidad de entradas no puede ser negativa.'] },
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

module.exports = mongoose.model('Evento', eventoSchema);