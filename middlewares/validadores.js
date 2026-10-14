import Evento from "../models/Evento.js";
import Sala from "../models/Sala.js";
import Usuario from "../models/Usuario.js";

// ==========================================
// 🏢 VALIDADOR DE SALAS
// ==========================================
export const validarSala = async (req, res, next) => {
    try {
        const { nombre, capacidad, ubicacion, general, platea, vip } = req.body;

        if (!nombre || !capacidad || !ubicacion) {
            return res.status(400).json({ error: "⚠️ Complete los campos obligatorios de la sala." });
        }

        const capTotal = Number(capacidad);
        const sumaZonas = (Number(general) || 0) + (Number(platea) || 0) + (Number(vip) || 0);

        if (sumaZonas !== capTotal) {
            return res.status(400).json({ 
                error: `⚠️ La capacidad total (${capTotal}) no coincide con la suma de los sectores (${sumaZonas}).` 
            });
        }

        next();
    } catch (error) {
        return res.status(400).json({ error: "⚠️ Error en la validación de la sala." });
    }
};

// ==========================================
// 👥 VALIDADOR DE USUARIOS
// ==========================================
export const validarUsuario = async (req, res, next) => {
    try {
        const { nombre, apellido, dni, correo, cumpleaños, username, password } = req.body;

        if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username || !password) {
            return res.status(400).json({ error: "⚠️ Todos los campos del usuario son obligatorios." });
        }

        if (nombre.trim().length > 15 || apellido.trim().length > 15) {
            return res.status(400).json({ error: "⚠️ El nombre y el apellido no deben superar los 15 caracteres." });
        }

        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!soloLetrasRegex.test(nombre) || !soloLetrasRegex.test(apellido)) {
            return res.status(400).json({ error: "⚠️ El nombre y el apellido deben contener únicamente letras." });
        }

        const dniRegex = /^\d{7,8}$/;
        if (!dniRegex.test(dni)) {
            return res.status(400).json({ error: "⚠️ El DNI debe ser numérico y tener entre 7 y 8 dígitos." });
        }

        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(correo)) {
            return res.status(400).json({ error: "⚠️ El formato del correo electrónico no es válido." });
        }

        let fechaNacimiento = new Date(cumpleaños);
        if (isNaN(fechaNacimiento.getTime())) {
            return res.status(400).json({ error: "⚠️ La fecha de cumpleaños ingresada no es válida." });
        }

        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }

        if (edad < 18) {
            return res.status(400).json({ error: "❌ El usuario debe ser mayor de edad (18 años o más)." });
        }

        const dniExistente = await Usuario.findOne({ dni });
        if (dniExistente) {
            return res.status(400).json({ error: "⚠️ El DNI ingresado ya se encuentra registrado." });
        }

        const correoExistente = await Usuario.findOne({ correo });
        if (correoExistente) {
            return res.status(400).json({ error: "⚠️ El correo electrónico ingresado ya se encuentra registrado." });
        }

        const usernameExistente = await Usuario.findOne({ username });
        if (usernameExistente) {
            return res.status(400).json({ error: "⚠️ El nombre de usuario ya está en uso." });
        }

        next();
    } catch (error) {
        return res.status(400).json({ error: "⚠️ Error en la validación del usuario." });
    }
};

// ==========================================
// 🎭 VALIDADOR DE EVENTOS (Asegurado)
// ==========================================
export const validarEvento = async (req, res, next) => {
    try {
        const { titulo, artista, sala, fecha, hora, precio } = req.body;

        if (!titulo || !artista || !sala || !fecha || !hora || precio === undefined) {
            return res.status(400).json({ error: "⚠️ Complete todos los campos obligatorios del evento." });
        }

        const precioNum = Number(precio);
        if (isNaN(precioNum) || precioNum < 1000) {
            return res.status(400).json({ error: "⚠️ El precio del evento debe ser de al menos $1000." });
        }

        next();
    } catch (error) {
        return res.status(400).json({ error: "⚠️ Error en la validación del evento." });
    }
};