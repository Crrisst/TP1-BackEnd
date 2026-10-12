//const mongoose = require('mongoose');

import mongoose from 'mongoose';

const cancelacionSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  nombreCliente: String,
  eventoNombre: String,
  codigoBoleto: String,
  cantidad: { type: Number, default: 1 },
  fechaCancelacion: { type: Date, default: Date.now }
}, { timestamps: true });

//module.exports = mongoose.models.CancelacionLog || mongoose.model('CancelacionLog', cancelacionSchema);

export default mongoose.models.CancelacionLog || mongoose.model('CancelacionLog', cancelacionSchema);