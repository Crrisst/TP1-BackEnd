import Evento from "../models/Evento.js";
import Sala from "../models/Sala.js";
import Usuario from "../models/Usuario.js";

// Dashboard / Menú Principal Admin
export const renderAdminPanel = async (req, res, next) => {
    try {
        if (!req.session.usuario || !['Admin', 'Administrador', 'Supervisor'].includes(req.session.usuario.rol)) {
            return res.redirect("/");
        }
        res.render("admin/dashboard", { usuario: req.session.usuario });
    } catch (error) { next(error); }
};

// --- GESTIÓN DE SALAS ---
export const renderSalasAdmin = async (req, res, next) => {
    try {
        if (!req.session.usuario || !['Admin', 'Administrador', 'Supervisor'].includes(req.session.usuario.rol)) {
            return res.redirect("/");
        }
        const salas = await Sala.find();
        res.render("admin/salas", { 
            usuarioLogueado: req.session.usuario, 
            salas, 
            datos: null, 
            exito: null, 
            error: null 
        });
    } catch (error) { next(error); }
};

export const crearSala = async (req, res, next) => {
    try {
        const { nombre, capacidad, ubicacion, descripcion, general, platea, vip } = req.body;
        
        if (!nombre || !capacidad || !ubicacion) {
            const salas = await Sala.find();
            return res.render("admin/salas", { 
                usuarioLogueado: req.session.usuario, 
                salas, 
                datos: req.body, 
                exito: null, 
                error: "⚠️ Por favor, complete los campos obligatorios: Nombre, Capacidad y Ubicación." 
            });
        }

        await Sala.create({
            nombre,
            capacidad: Number(capacidad),
            ubicacion,
            descripcion,
            zonas: {
                General: Number(general) || 0,
                Platea: Number(platea) || 0,
                VIP: Number(vip) || 0
            }
        });

        res.redirect("/admin/salas");
    } catch (error) { 
        const salas = await Sala.find();
        res.render("admin/salas", { 
            usuarioLogueado: req.session.usuario, 
            salas, 
            datos: req.body, 
            exito: null, 
            error: "❌ Ocurrió un error al registrar la sala. Verifique que los datos sean correctos." 
        }); 
    }
};

export const eliminarSala = async (req, res, next) => {
    try {
        if (!req.session.usuario || !['Admin', 'Administrador', 'Supervisor'].includes(req.session.usuario.rol)) {
            return res.redirect("/");
        }
        await Sala.findByIdAndDelete(req.params.id);
        res.redirect("/admin/salas");
    } catch (error) { next(error); }
};

// --- GESTIÓN DE USUARIOS ---
export const renderUsuariosAdmin = async (req, res, next) => {
    try {
        if (!req.session.usuario || !['Admin', 'Administrador', 'Supervisor'].includes(req.session.usuario.rol)) return res.redirect("/");
        const usuarios = await Usuario.find();
        const usuarioEdit = req.query.editar ? await Usuario.findById(req.query.editar) : null;
        res.render("admin/usuarios", { usuario: req.session.usuario, usuarios, editUsuario: usuarioEdit });
    } catch (error) { next(error); }
};

export const crearUsuarioAdmin = async (req, res, next) => {
    try {
        await Usuario.create(req.body);
        res.redirect("/admin/usuarios");
    } catch (error) { 
        const usuarios = await Usuario.find();
        res.render("admin/usuarios", { 
            usuario: req.session.usuario, 
            usuarios, 
            editUsuario: null,
            error: "❌ No se pudo crear el usuario. Es probable que el DNI o el Nombre de Usuario (username) ya se encuentren registrados." 
        }); 
    }
};

// 👈 ¡Aquí está restaurada la función que faltaba!
export const actualizarUsuario = async (req, res, next) => {
    try {
        const { nombre, apellido, dni, cumpleaños, username, password, rol } = req.body;
        const datosActualizados = { nombre, apellido, dni, cumpleaños, username, rol };
        if (password) datosActualizados.password = password;

        await Usuario.findByIdAndUpdate(req.params.id, datosActualizados);
        res.redirect("/admin/usuarios");
    } catch (error) { 
        const usuarios = await Usuario.find();
        const usuarioEdit = await Usuario.findById(req.params.id);
        res.render("admin/usuarios", { 
            usuario: req.session.usuario, 
            usuarios, 
            editUsuario: usuarioEdit,
            error: "❌ Error al modificar los datos del usuario." 
        });
    }
};

export const eliminarUsuario = async (req, res, next) => {
    try {
        if (!req.session.usuario || !['Admin', 'Administrador', 'Supervisor'].includes(req.session.usuario.rol)) return res.redirect("/");
        await Usuario.findByIdAndDelete(req.params.id);
        res.redirect("/admin/usuarios");
    } catch (error) { next(error); }
};

// --- GESTIÓN DE EVENTOS ---
export const renderEventosAdmin = async (req, res, next) => {
    try {
        if (!req.session.usuario || !['Admin', 'Administrador', 'Supervisor'].includes(req.session.usuario.rol)) return res.redirect("/");
        const eventos = await Evento.find().populate("sala");
        const salas = await Sala.find();
        res.render("admin/eventos", { usuario: req.session.usuario, eventos, salas, exito: null, error: null });
    } catch (error) { next(error); }
};

export const crearEvento = async (req, res, next) => {
    try {
        const { titulo, artista, descripcion, sala, fecha, hora, precio } = req.body;
        await Evento.create({ 
            titulo, 
            artista, 
            descripcion, 
            sala, 
            fecha, 
            hora, 
            precio 
        });
        res.redirect("/admin/eventos");
    } catch (error) { 
        const eventos = await Evento.find().populate("sala");
        const salas = await Sala.find();
        res.render("admin/eventos", { 
            usuario: req.session.usuario, 
            eventos, 
            salas, 
            exito: null, 
            error: "❌ Error al programar el evento. Compruebe que todos los campos obligatorios estén completados correctamente." 
        }); 
    }
};

export const eliminarEvento = async (req, res, next) => {
    try {
        if (!req.session.usuario || !['Admin', 'Administrador', 'Supervisor'].includes(req.session.usuario.rol)) return res.redirect("/");
        await Evento.findByIdAndDelete(req.params.id);
        res.redirect("/admin/eventos");
    } catch (error) { next(error); }
};