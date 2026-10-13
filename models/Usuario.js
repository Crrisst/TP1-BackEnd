import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  nombreUsuario: { type: String, required: true, unique: true },
  nombre: { type: String, required: true, match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras'] },
  apellido: { type: String, required: true, match: [/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, 'Solo letras'] },
  email: { type: String, required: true, unique: true, match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email válido'] },
  password: { type: String, required: true },
  dni: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  telefono: { type: String, required: true },
  rol: { type: String, enum: ['Cliente', 'Administrador', 'Supervisor', 'Lector'], default: 'Cliente' },
  tipoCliente: { type: String, enum: ['ESTANDAR', 'PREMIUM', 'VIP', 'Regular'], default: 'ESTANDAR' },
  porcentajeDescuento: { type: Number, default: 0 }
}, { timestamps: true });

// Se eliminó el middleware pre('save') que encriptaba la contraseña

export default mongoose.model('Usuario', usuarioSchema);