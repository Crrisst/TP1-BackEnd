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
    res.redirect("/auth/login");
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
        res.redirect("/admin/usuarios");
    } catch (error) {
        console.error(error);
        const usuarios = await Usuario.find();
        res.render("admin/usuarios", {
            usuario: req.session.usuario,
            usuarios,
            editUsuario: null,
            datos: req.body,
            error: "⚠️ Error al registrar el usuario."
        });
    }
});

router.post("/usuarios/editar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, correo, cumpleaños, username, password, rol } = req.body;

        const dniDuplicado = await Usuario.findOne({ _id: { $ne: id }, dni });
        if (dniDuplicado) {
            const usuarios = await Usuario.find();
            const editUsuario = await Usuario.findById(id);
            return res.render("admin/usuarios", {
                usuario: req.session.usuario, usuarios, editUsuario, datos: req.body,
                error: "⚠️ El DNI ingresado ya pertenece a otro usuario."
            });
        }

        const correoDuplicado = await Usuario.findOne({ _id: { $ne: id }, correo });
        if (correoDuplicado) {
            const usuarios = await Usuario.find();
            const editUsuario = await Usuario.findById(id);
            return res.render("admin/usuarios", {
                usuario: req.session.usuario, usuarios, editUsuario, datos: req.body,
                error: "⚠️ El correo electrónico ingresado ya pertenece a otro usuario."
            });
        }

        const usernameDuplicado = await Usuario.findOne({ _id: { $ne: id }, username });
        if (usernameDuplicado) {
            const usuarios = await Usuario.find();
            const editUsuario = await Usuario.findById(id);
            return res.render("admin/usuarios", {
                usuario: req.session.usuario, usuarios, editUsuario, datos: req.body,
                error: "⚠️ El nombre de usuario (username) ya está siendo utilizado por otro usuario."
            });
        }

        const datosActualizados = { nombre, apellido, dni, correo, cumpleaños, username, rol };
        
        if (password && password.trim() !== "") {
            datosActualizados.password = password;
        }

        await Usuario.findByIdAndUpdate(id, datosActualizados);
        res.redirect("/admin/usuarios");
    } catch (error) { 
        console.error(error);
        const usuarios = await Usuario.find();
        const editUsuario = await Usuario.findById(req.params.id);
        res.render("admin/usuarios", { 
            usuario: req.session.usuario, 
            usuarios, 
            editUsuario,
            datos: req.body,
            error: "❌ Error al modificar los datos del usuario." 
        });
    }
});

router.post("/usuarios/eliminar/:id", async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.redirect("/admin/usuarios");
    } catch (error) {
        console.error(error);
        res.redirect("/admin/usuarios");
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

        const nuevaSala = new Sala({
            nombre,
            capacidad: Number(capacidad),
            ubicacion,
            descripcion: descripcion || "",
            zonas: {
                General: Number(general) || 0,
                Platea: Number(platea) || 0,
                VIP: Number(vip) || 0
            }
        });

        await nuevaSala.save();
        res.redirect("/admin/salas");
    } catch (error) {
        console.error(error);
        const salas = await Sala.find();
        res.render("admin/salas", { 
            usuarioLogueado: req.session.usuario, 
            salas, 
            datos: req.body, 
            error: "⚠️ Error interno al registrar la sala.", 
            exito: null 
        });
    }
});

router.post("/salas/eliminar/:id", async (req, res) => {
    try {
        await Sala.findByIdAndDelete(req.params.id);
        res.redirect("/admin/salas");
    } catch (error) {
        console.error(error);
        res.redirect("/admin/salas");
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

        const nuevoEvento = new Evento({
            titulo,
            artista,
            descripcion: descripcion || "",
            sala,
            fecha,
            hora,
            precio: Number(precio)
        });

        await nuevoEvento.save();
        res.redirect("/admin/eventos");
    } catch (error) {
        console.error(error);
        const eventos = await Evento.find().populate("sala");
        const salas = await Sala.find();
        res.render("admin/eventos", { 
            usuario: req.session.usuario, 
            eventos, 
            salas, 
            datos: req.body, 
            error: "⚠️ Error al registrar el evento en la base de datos.", 
            exito: null 
        });
    }
});

router.post("/eventos/eliminar/:id", async (req, res) => {
    try {
        await Evento.findByIdAndDelete(req.params.id);
        res.redirect("/admin/eventos");
    } catch (error) {
        console.error(error);
        res.redirect("/admin/eventos");
    }
});

// ==========================================
// 💳 GESTIÓN Y VISUALIZACIÓN DE TRANSACCIONES (CLIENTES)
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