const mongoose = require('mongoose');

const salaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  capacidad: { type: Number, required: true, min: [1, 'La capacidad de la sala debe ser mayor a 0.'] },
  ubicacion: { type: String } // <-- Agregamos este campo que faltaba
}, { timestamps: true });

salaSchema.methods.obtenerInformacion = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    descripcion: this.descripcion,
    capacidad: this.capacidad,
    ubicacion: this.ubicacion // <-- Y lo incluimos aquí también
  };
};

module.exports = mongoose.model('Sala', salaSchema);