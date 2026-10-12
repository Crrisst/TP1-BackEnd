import mongoose from 'mongoose';

const transaccionSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  nombreCliente: String,
  items: Array,
  subtotal: Number,          // 👈 Agregado
  descuentoAplicado: Number, // 👈 Agregado
  total: Number,
  medioPago: String,
  tarjetaUltimosDigitos: String,
  comprobanteId: String,
  fechaCompra: { type: Date, default: Date.now }
});

export default mongoose.models.Transaccion || mongoose.model('Transaccion', transaccionSchema);