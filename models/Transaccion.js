import mongoose from 'mongoose';

const itemTransaccionSchema = new mongoose.Schema({
  eventoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
  nombreEvento: { type: String, required: true },
  tipoEntrada: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precio: { type: Number, required: true, min: 0 }
}, { _id: false });

const transaccionSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombreCliente: { type: String, required: true },
  items: [itemTransaccionSchema],
  subtotal: { type: Number, required: true, min: 0 },
  descuentoAplicado: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  medioPago: { type: String, required: true },
  tarjetaUltimosDigitos: String,
  comprobanteId: { type: String, required: true },
  fechaCompra: { type: Date, default: Date.now }
});

export default mongoose.models.Transaccion || mongoose.model('Transaccion', transaccionSchema);