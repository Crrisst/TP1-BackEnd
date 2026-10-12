import mongoose from 'mongoose';
import { ZONAS } from './Sala.js';

const entradaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  evento: { type: mongoose.Schema.Types.ObjectId, ref: 'Evento', required: true },
  nombre: { type: String, required: true },
  descripcion: { type: String },
  precio: { type: Number, required: true, min: [0, 'El precio no puede ser negativo.'] },
  cantidad: { type: Number, required: true, min: [0, 'La cantidad de entradas no puede ser negativa.'] },
  fila: { type: String, default: 'Fila 4' },
  asiento: { type: String, default: 'Asiento 12' },
  sector: { type: String, default: 'Platea' }, // 👈 Corregido a una zona válida del sistema
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

async function cancelarEntradaZona(entradaId, clienteId) {
  const entrada = await mongoose.model('Entrada').findOne({ _id: entradaId, cliente: clienteId });
  if (!entrada) throw Object.assign(new Error('Entrada no encontrada para este usuario.'), { status: 404 });
  if (entrada.evento) await mongoose.model('Evento').prepararStockZonas(entrada.evento);
  const eliminada = await mongoose.model('Entrada').findOneAndDelete({ _id: entradaId, cliente: clienteId });
  if (!eliminada) throw Object.assign(new Error('La entrada ya fue cancelada.'), { status: 409 });
  try {
    const sector = eliminada.sector === 'Platea Preferencial' ? 'Platea' : eliminada.sector;
    await mongoose.model('Evento').liberarZona(eliminada.evento, ZONAS.includes(sector) ? sector : 'General', eliminada.cantidad);
  } catch (error) {
    await mongoose.model('Entrada').create(eliminada.toObject());
    throw error;
  }
  return eliminada;
}

entradaSchema.statics.cancelarEntradaZona = cancelarEntradaZona;

export default mongoose.model('Entrada', entradaSchema);