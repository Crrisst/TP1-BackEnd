import mongoose from 'mongoose';
import { ZONAS } from './Sala.js';

const entradaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
  nombre: { type: String, required: true },
  descripcion: String,
  precio: { type: Number, required: true, min: 0 },
  cantidad: { type: Number, required: true, min: 0 },
  fila: { type: String, default: 'Fila Única' },
  asiento: { type: String, default: 'General' },
  sector: { type: String, default: 'General' },
  codigoBoleto: { type: String, default: () => 'TICK-' + Math.floor(100000 + Math.random() * 900000) },
  estado: { type: String, default: 'Completado' }
}, { timestamps: true });

async function cancelarEntradaZona(entradaId, clienteId) {
  const entrada = await mongoose.model('Entrada').findOne({ _id: entradaId, cliente: clienteId });
  if (!entrada) throw Object.assign(new Error('Entrada no encontrada.'), { status: 404 });
  
  await mongoose.model('Evento').prepararStockZonas(entrada.evento);
  const eliminada = await mongoose.model('Entrada').findOneAndDelete({ _id: entradaId });
  
  if (!eliminada) throw Object.assign(new Error('La entrada ya fue cancelada.'), { status: 409 });

  try {
    const sector = ZONAS.includes(eliminada.sector) ? eliminada.sector : 'General';
    await mongoose.model('Evento').liberarZona(eliminada.evento, sector, eliminada.cantidad);
  } catch (error) {
    // Rollback manual si falla la liberación de stock
    await mongoose.model('Entrada').create(eliminada.toObject());
    throw error;
  }
  
  return eliminada;
}

entradaSchema.statics.cancelarEntradaZona = cancelarEntradaZona;
export default mongoose.model('Entrada', entradaSchema);