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
// 👥 VALIDADOR GENERAL DE USUARIOS (Registro / Admin)
// ==========================================
export const validarUsuario = async (req, res, next) => {
    try {
        const { nombre, apellido, dni, correo, cumpleaños, username, password } = req.body;
        const usuarioId = req.params.id; // Detecta si estamos editando desde el panel de admin

        if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username) {
            return res.status(400).json({ error: "⚠️ Todos los campos obligatorios del usuario son requeridos." });
        }

        // Validación estricta de longitud máxima (15 caracteres)
        if (nombre.trim().length > 15 || apellido.trim().length > 15) {
            return res.status(400).json({ error: "⚠️ El nombre y el apellido no deben superar los 15 caracteres." });
        }

        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!soloLetrasRegex.test(nombre.trim()) || !soloLetrasRegex.test(apellido.trim())) {
            return res.status(400).json({ error: "⚠️ El nombre y el apellido deben contener únicamente letras." });
        }

        const dniRegex = /^\d{7,8}$/;
        if (!dniRegex.test(dni.trim())) {
            return res.status(400).json({ error: "⚠️ El DNI debe ser numérico y tener entre 7 y 8 dígitos." });
        }

        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(correo.trim())) {
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

        // Verificación de duplicados (excluyendo al usuario actual en caso de edición)
        const queryDni = usuarioId ? { _id: { $ne: usuarioId }, dni: dni.trim() } : { dni: dni.trim() };
        const dniExistente = await Usuario.findOne(queryDni);
        if (dniExistente) {
            return res.status(400).json({ error: "⚠️ El DNI ingresado ya se encuentra registrado por otro usuario." });
        }

        const queryCorreo = usuarioId ? { _id: { $ne: usuarioId }, correo: correo.trim() } : { correo: correo.trim() };
        const correoExistente = await Usuario.findOne(queryCorreo);
        if (correoExistente) {
            return res.status(400).json({ error: "⚠️ El correo electrónico ingresado ya se encuentra registrado." });
        }

        const queryUsername = usuarioId ? { _id: { $ne: usuarioId }, username: username.trim() } : { username: username.trim() };
        const usernameExistente = await Usuario.findOne(queryUsername);
        if (usernameExistente) {
            return res.status(400).json({ error: "⚠️ El nombre de usuario ya está en uso." });
        }

        next();
    } catch (error) {
        console.error("Error en validación de usuario:", error);
        return res.status(400).json({ error: "⚠️ Error en la validación del usuario." });
    }
};

// ==========================================
// 🎭 VALIDADOR DE EVENTOS
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