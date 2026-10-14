import mongoose from "mongoose";

const entradaSchema = new mongoose.Schema({
    evento: { type: mongoose.Schema.Types.ObjectId, ref: "Evento", required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    cantidad: { type: Number, required: true, min: 1, default: 1 },
    metodoPago: { type: String, default: "Tarjeta de Crédito" },
    estado: { type: String, enum: ["Valida", "Cancelada"], default: "Valida" },
    fechaCompra: { type: Date, default: Date.now }
});

export default mongoose.model("Entrada", entradaSchema);