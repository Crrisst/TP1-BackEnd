import mongoose from 'mongoose';

const entidadSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  }
}, { timestamps: true });

// Forzamos el nombre de la colección a 'entidades' para evitar el 'entidads'
export default mongoose.models.Entidad || mongoose.model('Entidad', entidadSchema, 'entidades');