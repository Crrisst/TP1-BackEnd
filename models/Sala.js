import mongoose from "mongoose";

const salaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    capacidad: { type: Number, required: true, min: [1, "La capacidad debe ser al menos 1"] },
    ubicacion: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },
    zonas: {
        General: { type: Number, default: 0, min: 0 },
        Platea: { type: Number, default: 0, min: 0 },
        VIP: { type: Number, default: 0, min: 0 }
    }
});

export default mongoose.model("Sala", salaSchema);