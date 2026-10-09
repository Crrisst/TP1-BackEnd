// src/models/Usuario.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dni: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  telefono: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['Cliente', 'Administrador', 'Supervisor', 'Lector'], 
    default: 'Cliente' 
  },
  tipoCliente: { 
    type: String, 
    enum: ['ESTANDAR', 'PREMIUM', 'VIP', 'Regular'], 
    default: 'ESTANDAR' 
  },
  porcentajeDescuento: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);