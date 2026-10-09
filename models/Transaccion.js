// models/Transaccion.js
const mongoose = require('mongoose');

const transaccionSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  nombreCliente: String,
  items: Array,
  total: Number,
  medioPago: String,
  tarjetaUltimosDigitos: String,
  comprobanteId: String,
  fechaCompra: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Transaccion || mongoose.model('Transaccion', transaccionSchema);