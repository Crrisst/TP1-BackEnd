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
  fechaNacimiento: { 
    type: Date, 
    required: [true, 'La fecha de nacimiento es obligatoria.'],
    validate: {
      validator: function(v) {
        if (!v) return false;
        const fechaNac = new Date(v);
        if (isNaN(fechaNac.getTime())) return false;
        
        const anio = fechaNac.getFullYear();
        if (anio < 1900) return false;

        const hoy = new Date();
        let edad = hoy.getFullYear() - anio;
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
          edad--;
        }

        return edad >= 18 && edad <= 120;
      },
      message: 'La fecha de nacimiento no es válida. Debe corresponder a una persona mayor de 18 años y con un año posterior a 1900.'
    }
  },
  telefono: { 
    type: String, 
    required: true,
    match: [/^\d{10}$/, 'El teléfono debe contener exactamente 10 números']
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