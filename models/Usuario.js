import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    dni: { type: String, required: true, unique: true, trim: true },
    correo: { type: String, required: true, unique: true, trim: true },
    cumpleaños: { type: String, required: true }, 
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    rol: { type: String, enum: ["Admin", "Cliente", "Supervisor", "Administrador"], default: "Cliente" }
});

export default mongoose.model("Usuario", usuarioSchema);