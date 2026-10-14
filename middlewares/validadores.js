import Evento from "../models/Evento.js";
import Sala from "../models/Sala.js";
import Usuario from "../models/Usuario.js";

// ==========================================
// 🏢 VALIDADOR DE SALAS
// ==========================================
export const validarSala = async (req, res, next) => {
    const { nombre, capacidad, ubicacion, general, platea, vip } = req.body;

    if (!nombre || !capacidad || !ubicacion) {
        return res.status(400).json({ error: "⚠️ Faltan campos obligatorios para la sala." });
    }

    const capNum = Number(capacidad);
    if (isNaN(capNum) || capNum < 1) {
        return res.status(400).json({ error: "⚠️ La capacidad total de la sala debe ser un número entero mayor o igual a 1." });
    }

    const g = Number(general) || 0;
    const p = Number(platea) || 0;
    const v = Number(vip) || 0;

    if (g < 0 || p < 0 || v < 0) {
        return res.status(400).json({ error: "⚠️ Los cupos por zona no pueden tener valores negativos." });
    }

    const sumaZonas = g + p + v;
    if (sumaZonas === 0) {
        return res.status(400).json({ error: "⚠️ Debe asignar al menos una zona con capacidad mayor a 0." });
    }

    if (sumaZonas !== capNum) {
        return res.status(400).json({ error: `⚠️ La suma de las zonas (${sumaZonas}) no coincide con la capacidad total (${capNum}).` });
    }

    next();
};

// ==========================================
// 👥 VALIDADOR DE USUARIOS
// ==========================================
export const validarUsuario = async (req, res, next) => {
    const { nombre, apellido, dni, correo, nacimiento, cumpleaños, username, password } = req.body;
    const fechaNacStr = nacimiento || cumpleaños;

    if (!nombre || !apellido || !dni || !correo || !fechaNacStr || !username || !password) {
        return res.status(400).json({ error: "⚠️ Todos los campos del usuario son obligatorios." });
    }

    // Nombre y apellido solo letras (admite tildes y espacios)
    const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!soloLetrasRegex.test(nombre.trim()) || !soloLetrasRegex.test(apellido.trim())) {
        return res.status(400).json({ error: "⚠️ El nombre y el apellido deben contener únicamente letras." });
    }

    // DNI numérico de 7 a 8 dígitos
    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(dni)) {
        return res.status(400).json({ error: "⚠️ El DNI debe ser numérico y tener exactamente 7 u 8 dígitos." });
    }

    // Correo real y con formato correcto
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
        return res.status(400).json({ error: "⚠️ El formato del correo electrónico no es válido." });
    }

    // Validación de fecha y mayoría de edad
    const partes = fechaNacStr.split("-");
    if (partes.length !== 3) {
        return res.status(400).json({ error: "⚠️ El formato de la fecha de nacimiento no es válido." });
    }

    const anioNac = parseInt(partes[0], 10);
    const mesNac = parseInt(partes[1], 10) - 1;
    const diaNac = parseInt(partes[2], 10);

    // 🛑 Bloquear años irreales (menores a 1900 o futuros)
    const anioActual = new Date().getFullYear();
    if (isNaN(anioNac) || anioNac < 1900 || anioNac > anioActual) {
        return res.status(400).json({ error: "⚠️ El año de nacimiento ingresado no es válido o es irreal." });
    }

    const fechaNacimiento = new Date(anioNac, mesNac, diaNac);
    if (isNaN(fechaNacimiento.getTime())) {
        return res.status(400).json({ error: "⚠️ La fecha de nacimiento ingresada no es válida." });
    }

    const hoy = new Date();
    if (fechaNacimiento > hoy) {
        return res.status(400).json({ error: "⚠️ La fecha de nacimiento no puede ser en el futuro." });
    }

    let edad = anioActual - anioNac;
    const mesActualNum = hoy.getMonth();
    const diaActualNum = hoy.getDate();

    if (mesActualNum < mesNac || (mesActualNum === mesNac && diaActualNum < diaNac)) {
        edad--;
    }

    if (edad < 18) {
        return res.status(400).json({ error: "❌ El usuario debe ser mayor de edad (18 años o más) para registrarse." });
    }

    // Comprobación de duplicados en la base de datos
    const dniExistente = await Usuario.findOne({ dni });
    if (dniExistente) {
        return res.status(400).json({ error: "⚠️ El DNI ingresado ya se encuentra registrado en el sistema." });
    }

    const correoExistente = await Usuario.findOne({ correo });
    if (correoExistente) {
        return res.status(400).json({ error: "⚠️ El correo electrónico ingresado ya se encuentra registrado." });
    }

    const usernameExistente = await Usuario.findOne({ username });
    if (usernameExistente) {
        return res.status(400).json({ error: "⚠️ El nombre de usuario (username) ya está en uso. Elija otro." });
    }

    next();
};

// ==========================================
// 🎟️ VALIDADOR DE EVENTOS
// ==========================================
export const validarEvento = async (req, res, next) => {
    const { titulo, artista, sala, fecha, hora, precio } = req.body;
    
    if (!titulo || !artista || !sala || !fecha || !hora || precio === undefined || precio === "") {
        return res.status(400).json({ error: "⚠️ Faltan campos obligatorios para crear el evento." });
    }

    const partesFecha = fecha.split("-");
    const anioEvento = partesFecha[0];
    
    if (!anioEvento || anioEvento.length !== 4 || isNaN(Number(anioEvento))) {
        return res.status(400).json({ error: "⚠️ El año del evento no es válido. Debe tener exactamente 4 dígitos." });
    }

    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 1000) {
        return res.status(400).json({ error: "⚠️ El precio del evento debe ser mayor a $1000." });
    }
    
    const fechaIngresada = new Date(fecha);
    const hoyCero = new Date();
    hoyCero.setHours(0, 0, 0, 0);

    if (isNaN(fechaIngresada.getTime())) {
        return res.status(400).json({ error: "⚠️ La fecha del evento ingresada no es válida." });
    }

    if (fechaIngresada < hoyCero) {
        return res.status(400).json({ error: "❌ La fecha del evento no puede ser en el pasado." });
    }
    
    next();
};