import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: { type: String, required: true, unique: true },
  nombre: { 
    type: String, 
    required: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo puede contener letras']
  },
  apellido: { 
    type: String, 
    required: true,
    match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'El apellido solo puede contener letras']
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Debe ser un correo electrónico válido']
  },
  password: { type: String, required: true },
  dni: { 
    type: String, 
    required: true,
    match: [/^\d{7,8}$/, 'El DNI debe tener entre 7 y 8 números sin letras']
  },
  fechaNacimiento: { type: Date, required: true },
  telefono: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, 'El teléfono debe contener exactamente 10 números'] // 👈 Corregido a 10 dígitos estrictos
  },
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

export default mongoose.model('Usuario', usuarioSchema);