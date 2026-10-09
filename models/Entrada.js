// models/Entrada.js
const mongoose = require('mongoose');

const entradaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true, min: [0, 'El precio no puede ser negativo.'] },
  cantidad: { type: Number, required: true, min: [0, 'La cantidad de entradas no puede ser negativa.'] },
  fila: { type: String, default: 'Fila 4' },
  asiento: { type: String, default: 'Asiento 12' },
  sector: { type: String, default: 'Platea Preferencial' },
  codigoBoleto: { type: String, default: () => 'TICK-' + Math.floor(100000 + Math.random() * 900000) },
  estado: { type: String, default: 'Completado' }
}, { timestamps: true });

entradaSchema.methods.calcularSubtotal = function() {
  return this.precio * this.cantidad;
};

entradaSchema.methods.obtenerDetalle = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    descripcion: this.descripcion,
    precio: this.precio,
    cantidad: this.cantidad,
    subtotal: this.calcularSubtotal(),
    fila: this.fila,
    asiento: this.asiento,
    sector: this.sector,
    codigoBoleto: this.codigoBoleto
  };
};

module.exports = mongoose.model('Entrada', entradaSchema);