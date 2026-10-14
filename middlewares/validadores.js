import Evento from "../models/Evento.js";
import Sala from "../models/Sala.js";
import Usuario from "../models/Usuario.js";

export const validarSala = async (req, res, next) => {
    const { nombre, capacidad, ubicacion, general, platea, vip } = req.body;
    
    const renderError = async (mensaje) => {
        const salas = await Sala.find();
        return res.render("admin/salas", { 
            usuarioLogueado: req.session.usuario, 
            salas, 
            datos: req.body, 
            exito: null, 
            error: mensaje 
        });
    };

    if (!nombre || !capacidad || !ubicacion) {
        return renderError("⚠️ Faltan campos obligatorios para la sala.");
    }

    const capNum = Number(capacidad);
    if (isNaN(capNum) || capNum < 1) {
        return renderError("⚠️ La capacidad total da la sala debe ser un número entero mayor o igual a 1.");
    }

    const g = Number(general) || 0;
    const p = Number(platea) || 0;
    const v = Number(vip) || 0;

    if (g < 0 || p < 0 || v < 0) {
        return renderError("⚠️ Los cupos por zona no pueden tener valores negativos.");
    }

    const sumaZonas = g + p + v;
    if (sumaZonas === 0) {
        return renderError("⚠️ Debe asignar al menos una zona con capacidad mayor a 0.");
    }

    if (sumaZonas !== capNum) {
        return renderError(`⚠️ La suma de las zonas (${sumaZonas}) no coincide con la capacidad total (${capNum}).`);
    }

    next();
};

export const validarUsuario = async (req, res, next) => {
    const { nombre, apellido, dni, correo, cumpleaños, username, password } = req.body;

    const renderError = async (mensaje) => {
        const usuarios = await Usuario.find();
        return res.render("admin/usuarios", { 
            usuario: req.session.usuario, 
            usuarios, 
            editUsuario: null,
            datos: req.body,
            error: mensaje 
        });
    };

    if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username || !password) {
        return renderError("⚠️ Todos los campos del usuario son obligatorios.");
    }

    const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    if (!soloLetrasRegex.test(nombre) || !soloLetrasRegex.test(apellido)) {
        return renderError("⚠️ El nombre y el apellido deben contener únicamente letras.");
    }

    const dniRegex = /^\d{7,8}$/;
    if (!dniRegex.test(dni)) {
        return renderError("⚠️ El DNI debe ser numérico y tener entre 7 y 8 dígitos.");
    }

    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!correoRegex.test(correo)) {
        return renderError("⚠️ El formato del correo electrónico no es válido.");
    }

    const partesCumple = cumpleaños.split("-");
    if (partesCumple.length !== 3) {
        return renderError("⚠️ El formato de la fecha de cumpleaños no es válido.");
    }

    const anioCumple = partesCumple[0];
    if (!anioCumple || anioCumple.length !== 4) {
        return renderError("⚠️ El año de la fecha de cumpleaños debe tener exactamente 4 dígitos.");
    }

    let fechaNacimiento = new Date(parseInt(partesCumple[0]), parseInt(partesCumple[1]) - 1, parseInt(partesCumple[2]));
    if (isNaN(fechaNacimiento.getTime())) {
        return renderError("⚠️ La fecha de cumpleaños ingresada no es válida.");
    }

    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();
    
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    if (edad < 18) {
        return renderError("❌ El usuario debe ser mayor de edad (18 años o más) para registrarse.");
    }

    const dniExistente = await Usuario.findOne({ dni });
    if (dniExistente) {
        return renderError("⚠️ El DNI ingresado ya se encuentra registrado en el sistema.");
    }

    const correoExistente = await Usuario.findOne({ correo });
    if (correoExistente) {
        return renderError("⚠️ El correo electrónico ingresado ya se encuentra registrado.");
    }

    const usernameExistente = await Usuario.findOne({ username });
    if (usernameExistente) {
        return renderError("⚠️ El nombre de usuario (username) ya está en uso. Elija otro.");
    }

    next();
};

export const validarEvento = async (req, res, next) => {
    const { titulo, artista, sala, fecha, hora, precio } = req.body;
    
    const renderError = async (mensaje) => {
        const eventos = await Evento.find().populate("sala");
        const salas = await Sala.find();
        return res.render("admin/eventos", { 
            usuario: req.session.usuario, 
            eventos, 
            salas, 
            datos: req.body, 
            exito: null, 
            error: mensaje 
        });
    };

    if (!titulo || !artista || !sala || !fecha || !hora || precio === undefined || precio === "") {
        return renderError("⚠️ Faltan campos obligatorios para crear el evento.");
    }

    const partesFecha = fecha.split("-");
    const anioEvento = partesFecha[0];
    
    if (!anioEvento || anioEvento.length !== 4 || isNaN(Number(anioEvento))) {
        return renderError("⚠️ El año del evento no es válido. Debe tener exactamente 4 dígitos.");
    }

    if (Number(precio) < 0) {
        return renderError("⚠️ El precio del evento no puede ser negativo.");
    }
    
    // Corrección de zona horaria separando los componentes de la fecha local
    const anio = parseInt(partesFecha[0], 10);
    const mes = parseInt(partesFecha[1], 10) - 1;
    const dia = parseInt(partesFecha[2], 10);

    const fechaIngresada = new Date(anio, mes, dia);
    const hoy = new Date();
    const hoyCero = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    if (isNaN(fechaIngresada.getTime())) {
        return renderError("⚠️ La fecha del evento ingresada no es válida.");
    }

    if (fechaIngresada < hoyCero) {
        return renderError("❌ La fecha del evento no puede ser en el pasado.");
    }
    
    next();
};