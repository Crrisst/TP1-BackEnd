import express from "express";
import Usuario from "../models/Usuario.js";
import Sala from "../models/Sala.js";
import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";
import { validarSala, validarUsuario, validarEvento } from "../middlewares/validadores.js";

const router = express.Router();

const esAdmin = (req, res, next) => {
    if (req.session.usuario && (req.session.usuario.rol === "Admin" || req.session.usuario.rol === "Administrador")) {
        return next();
    }
    return res.status(401).json({ error: "No autorizado" });
};

router.use(esAdmin);

// ==========================================
// 🏠 DASHBOARD E INICIO DE ADMIN
// ==========================================
router.get("/", (req, res) => {
    res.render("admin/dashboard", { usuario: req.session.usuario });
});

router.get("/dashboard", (req, res) => {
    res.render("admin/dashboard", { usuario: req.session.usuario });
});

// ==========================================
// 👥 GESTIÓN DE USUARIOS
// ==========================================
router.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        const editId = req.query.editar;
        let editUsuario = null;
        if (editId) {
            editUsuario = await Usuario.findById(editId);
        }

        res.render("admin/usuarios", { 
            usuario: req.session.usuario, 
            usuarios, 
            editUsuario, 
            datos: null,
            error: null 
        });
    } catch (error) {
        console.error(error);
        res.redirect("/admin/dashboard");
    }
});

router.post("/usuarios", validarUsuario, async (req, res) => {
    try {
        const { nombre, apellido, dni, correo, cumpleaños, username, password, rol } = req.body;
        
        const nuevoUsuario = new Usuario({
            nombre,
            apellido,
            dni,
            correo,
            cumpleaños,
            username,
            password,
            rol: rol || "Cliente"
        });

        await nuevoUsuario.save();
        return res.status(200).json({ success: true, mensaje: "Usuario creado con éxito." });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "⚠️ Error al registrar el usuario. Verifique los datos." });
    }
});

router.post("/usuarios/editar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, correo, cumpleaños, username, password, rol } = req.body;

        const dniDuplicado = await Usuario.findOne({ _id: { $ne: id }, dni });
        if (dniDuplicado) {
            return res.status(400).json({ error: "⚠️ El DNI ingresado ya pertenece a otro usuario." });
        }

        const correoDuplicado = await Usuario.findOne({ _id: { $ne: id }, correo });
        if (correoDuplicado) {
            return res.status(400).json({ error: "⚠️ El correo electrónico ya pertenece a otro usuario." });
        }

        const usernameDuplicado = await Usuario.findOne({ _id: { $ne: id }, username });
        if (usernameDuplicado) {
            return res.status(400).json({ error: "⚠️ El nombre de usuario ya está en uso." });
        }

        const datosActualizados = { nombre, apellido, dni, correo, cumpleaños, username, rol };
        if (password && password.trim() !== "") {
            datosActualizados.password = password;
        }

        await Usuario.findByIdAndUpdate(id, datosActualizados);
        return res.status(200).json({ success: true, mensaje: "Usuario modificado con éxito." });
    } catch (error) { 
        console.error(error);
        return res.status(500).json({ error: "❌ Error al modificar los datos del usuario." });
    }
});

router.post("/usuarios/eliminar/:id", async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar usuario." });
    }
});

// ==========================================
// 🏢 GESTIÓN DE SALAS
// ==========================================
router.get("/salas", async (req, res) => {
    try {
        const salas = await Sala.find();
        res.render("admin/salas", { 
            usuarioLogueado: req.session.usuario, 
            salas, 
            datos: null,
            error: null, 
            exito: null 
        });
    } catch (error) {
        console.error(error);
        res.redirect("/admin/dashboard");
    }
});

router.post("/salas", validarSala, async (req, res) => {
    try {
        const { nombre, capacidad, ubicacion, descripcion, general, platea, vip } = req.body;

        if (!nombre || !capacidad || !ubicacion) {
            return res.status(400).json({ error: "⚠️ Complete los campos obligatorios de la sala." });
        }

        const capTotal = Number(capacidad);
        const sumaZonas = (Number(general) || 0) + (Number(platea) || 0) + (Number(vip) || 0);

        if (sumaZonas !== capTotal) {
            return res.status(400).json({ 
                error: `⚠️ La capacidad total (${capTotal}) no coincide con la suma de los sectores (${sumaZonas}: General + Platea + VIP).` 
            });
        }

        const nuevaSala = new Sala({
            nombre: nombre.trim(),
            capacidad: capTotal,
            ubicacion: ubicacion.trim(),
            descripcion: descripcion ? descripcion.trim() : "",
            zonas: {
                General: Number(general) || 0,
                Platea: Number(platea) || 0,
                VIP: Number(vip) || 0
            }
        });

        await nuevaSala.save();
        return res.status(200).json({ success: true, mensaje: "Sala creada con éxito." });
    } catch (error) {
        console.error("Error al crear sala:", error);
        return res.status(400).json({ error: "⚠️ Error al registrar la sala. Verifique que no esté duplicada." });
    }
});

router.post("/salas/eliminar/:id", async (req, res) => {
    try {
        await Sala.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar sala." });
    }
});

// ==========================================
// 🎟️ GESTIÓN DE EVENTOS
// ==========================================
router.get("/eventos", async (req, res) => {
    try {
        const eventos = await Evento.find().populate("sala");
        const salas = await Sala.find();
        res.render("admin/eventos", { 
            usuario: req.session.usuario, 
            eventos, 
            salas, 
            datos: null,
            error: null, 
            exito: null 
        });
    } catch (error) {
        console.error(error);
        res.redirect("/admin/dashboard");
    }
});

router.post("/eventos", validarEvento, async (req, res) => {
    try {
        const { titulo, artista, descripcion, sala, fecha, hora, precio } = req.body;

        if (!titulo || !artista || !sala || !fecha || !hora || precio === undefined) {
            return res.status(400).json({ error: "⚠️ Complete todos los campos obligatorios del evento." });
        }

        const precioNum = Number(precio);
        if (isNaN(precioNum) || precioNum <= 1000) {
            return res.status(400).json({ error: "⚠️ El precio del evento debe ser mayor a $1000." });
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const [anio, mes, dia] = fecha.split("-").map(Number);
        const fechaEvento = new Date(anio, mes - 1, dia);
        fechaEvento.setHours(0, 0, 0, 0);

        if (fechaEvento < hoy) {
            return res.status(400).json({ error: "⚠️ La fecha del evento no puede ser anterior al día de hoy." });
        }

        if (fechaEvento.getTime() === hoy.getTime()) {
            const [horasEv, minutosEv] = hora.split(":").map(Number);
            const horaActual = new Date();
            const minutosActualesTotal = horaActual.getHours() * 60 + horaActual.getMinutes();
            const minutosEventoTotal = horasEv * 60 + minutosEv;

            if (minutosEventoTotal < minutosActualesTotal) {
                return res.status(400).json({ error: "⚠️ La hora del evento no puede ser anterior a la hora actual para el día de hoy." });
            }
        }

        const salaExiste = await Sala.findById(sala);
        if (!salaExiste) {
            return res.status(400).json({ error: "⚠️ La sala seleccionada no es válida o ya no existe." });
        }

        const nuevoEvento = new Evento({
            titulo: titulo.trim(),
            artista: artista.trim(),
            descripcion: descripcion ? descripcion.trim() : "",
            sala,
            fecha,
            hora,
            precio: precioNum
        });

        await nuevoEvento.save();
        return res.status(200).json({ success: true, mensaje: "Evento creado con éxito." });
    } catch (error) {
        console.error("Error al crear evento:", error);
        return res.status(400).json({ error: "⚠️ Error al registrar el evento en la base de datos." });
    }
});

router.post("/eventos/eliminar/:id", async (req, res) => {
    try {
        await Evento.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Error al eliminar evento." });
    }
});

// ==========================================
// 💳 TRANSACCIONES (CLIENTES)
// ==========================================
router.get("/transacciones", async (req, res) => {
    try {
        const transacciones = await Entrada.find()
            .populate("usuario", "nombre apellido dni correo")
            .populate("evento", "titulo precio")
            .sort({ fechaCompra: -1 });

        res.render("admin/transacciones", {
            usuario: req.session.usuario,
            transacciones
        });
    } catch (error) {
        console.error("Error al obtener transacciones:", error);
        res.redirect("/admin/dashboard");
    }
});

export default router;