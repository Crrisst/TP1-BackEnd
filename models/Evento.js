import mongoose from "mongoose";

const eventoSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    artista: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },
    sala: { type: mongoose.Schema.Types.ObjectId, ref: "Sala", required: true },
    fecha: { type: Date, required: true },
    hora: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    estado: { type: String, enum: ["Proximo", "Finalizado"], default: "Proximo" },
    entradasVendidas: { type: Number, default: 0 },
    entradasDisponibles: { type: Number, default: 100, min: 0 } // 🟢 Stock disponible integrado al esquema
});

export default mongoose.model("Evento", eventoSchema);