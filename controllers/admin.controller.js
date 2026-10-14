import Usuario from "../models/Usuario.js";
import Sala from "../models/Sala.js";
import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";

// Dashboard
export const renderDashboardAdmin = (req, res) => {
    res.render("admin/dashboard", { usuario: req.session.usuario });
};

// --- GESTIÓN DE USUARIOS ---
export const renderUsuariosAdmin = async (req, res) => {
    try {
        const usuarios = await Usuario.find().lean();
        const editId = req.query.editar;
        let editUsuario = null;
        
        if (editId) {
            const encontrado = await Usuario.findById(editId).lean();
            if (encontrado) {
                let fechaFormateada = "";
                if (encontrado.cumpleaños) {
                    const d = new Date(encontrado.cumpleaños);
                    fechaFormateada = !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : String(encontrado.cumpleaños).split('T')[0];
                }
                editUsuario = { ...encontrado, cumpleañosStr: fechaFormateada };
            }
        }

        res.render("admin/usuarios", { 
            usuario: req.session.usuario, 
            usuarios, 
            editUsuario, 
            datos: null,
            error: null 
        });
    } catch (error) {
        console.error("Error en usuarios admin:", error);
        res.redirect("/admin/dashboard");
    }
};

export const crearUsuarioAdmin = async (req, res) => {
    try {
        const { nombre, apellido, dni, correo, cumpleaños, username, password, rol } = req.body;
        
        if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username || !password) {
            return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios." });
        }

        if (nombre.trim().length > 15 || apellido.trim().length > 15) {
            return res.status(400).json({ error: "⚠️ El nombre y el apellido no deben superar los 15 caracteres." });
        }

        const dniExistente = await Usuario.findOne({ dni: dni.trim() });
        if (dniExistente) {
            return res.status(400).json({ error: "⚠️ El DNI ingresado ya se encuentra registrado." });
        }

        const correoExistente = await Usuario.findOne({ correo: correo.trim() });
        if (correoExistente) {
            return res.status(400).json({ error: "⚠️ El correo electrónico ya está en uso." });
        }

        const usernameExistente = await Usuario.findOne({ username: username.trim() });
        if (usernameExistente) {
            return res.status(400).json({ error: "⚠️ El nombre de usuario ya está en uso." });
        }

        const nuevoUsuario = new Usuario({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dni: dni.trim(),
            correo: correo.trim(),
            cumpleaños,
            username: username.trim(),
            password,
            rol: rol || "Cliente"
        });

        await nuevoUsuario.save();
        return res.status(200).json({ success: true, mensaje: "Usuario creado con éxito." });
    } catch (error) {
        console.error("Error al crear usuario admin:", error);
        return res.status(400).json({ error: "⚠️ Error al registrar el usuario. Verifique los datos." });
    }
};

export const editarUsuarioAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, correo, cumpleaños, username, password, rol } = req.body;

        const usuarioAEditar = await Usuario.findById(id);
        if (!usuarioAEditar) {
            return res.status(404).json({ error: "⚠️ Usuario no encontrado." });
        }

        if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username) {
            return res.status(400).json({ error: "⚠️ Todos los campos obligatorios deben ser completados." });
        }

        if (nombre.trim().length > 15 || apellido.trim().length > 15) {
            return res.status(400).json({ error: "⚠️ El nombre y el apellido no deben superar los 15 caracteres." });
        }

        if (usuarioAEditar.username === "admin" && rol !== usuarioAEditar.rol) {
            return res.status(400).json({ error: "⚠️ No se puede modificar el rol del usuario administrador principal." });
        }

        const dniDuplicado = await Usuario.findOne({ _id: { $ne: id }, dni: dni.trim() });
        if (dniDuplicado) {
            return res.status(400).json({ error: "⚠️ El DNI ingresado ya pertenece a otro usuario." });
        }

        const correoDuplicado = await Usuario.findOne({ _id: { $ne: id }, correo: correo.trim() });
        if (correoDuplicado) {
            return res.status(400).json({ error: "⚠️ El correo electrónico ya pertenece a otro usuario." });
        }

        const usernameDuplicado = await Usuario.findOne({ _id: { $ne: id }, username: username.trim() });
        if (usernameDuplicado) {
            return res.status(400).json({ error: "⚠️ El nombre de usuario ya está en uso." });
        }

        const datosActualizados = { 
            nombre: nombre.trim(), 
            apellido: apellido.trim(), 
            dni: dni.trim(), 
            correo: correo.trim(), 
            cumpleaños, 
            username: username.trim(), 
            rol: (usuarioAEditar.username === "admin") ? usuarioAEditar.rol : (rol || "Cliente")
        };

        if (password && password.trim() !== "") {
            datosActualizados.password = password;
        }

        await Usuario.findByIdAndUpdate(id, datosActualizados, { returnDocument: 'after' });
        return res.status(200).json({ success: true, mensaje: "Usuario modificado con éxito." });
    } catch (error) { 
        console.error("Error al editar usuario:", error);
        return res.status(500).json({ error: "❌ Error al modificar los datos del usuario." });
    }
};

export const eliminarUsuarioAdmin = async (req, res) => {
    try {
        const usuarioAEliminar = await Usuario.findById(req.params.id);
        if (!usuarioAEliminar) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        if (usuarioAEliminar.username === "admin") {
            return res.status(403).json({ error: "⚠️ No se puede eliminar al usuario administrador principal." });
        }

        await Usuario.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return res.status(500).json({ error: "Error al eliminar usuario." });
    }
};

// --- GESTIÓN DE SALAS ---
export const renderSalasAdmin = async (req, res) => {
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
        console.error("Error en salas admin:", error);
        res.redirect("/admin/dashboard");
    }
};

export const crearSalaAdmin = async (req, res) => {
    try {
        const { nombre, capacidad, ubicacion, descripcion, general, platea, vip } = req.body;

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
        return res.status(400).json({ error: "⚠️ Error al registrar la sala." });
    }
};

export const eliminarSalaAdmin = async (req, res) => {
    try {
        await Sala.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error al eliminar sala:", error);
        return res.status(500).json({ error: "Error al eliminar sala." });
    }
};

// --- GESTIÓN DE EVENTOS ---
export const renderEventosAdmin = async (req, res) => {
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
        console.error("Error en eventos admin:", error);
        res.redirect("/admin/dashboard");
    }
};

export const crearEventoAdmin = async (req, res) => {
    try {
        const { titulo, artista, descripcion, sala, fecha, hora, precio } = req.body;

        if (!titulo || !artista || !sala || !fecha || !hora || precio === undefined) {
            return res.status(400).json({ error: "⚠️ Complete todos los campos obligatorios del evento." });
        }

        const precioNum = Number(precio);
        if (isNaN(precioNum) || precioNum < 1000) {
            return res.status(400).json({ error: "⚠️ El precio del evento debe ser de al menos $1000." });
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
            precio: precioNum,
            entradasDisponibles: salaExiste.capacidad
        });

        await nuevoEvento.save();
        return res.status(200).json({ success: true, mensaje: "Evento creado con éxito." });
    } catch (error) {
        console.error("Error al crear evento:", error);
        return res.status(400).json({ error: "⚠️ Error al registrar el evento." });
    }
};

export const eliminarEventoAdmin = async (req, res) => {
    try {
        await Evento.findByIdAndDelete(req.params.id);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Error al eliminar evento:", error);
        return res.status(500).json({ error: "Error al eliminar evento." });
    }
};

// --- TRANSACCIONES ---
export const renderTransaccionesAdmin = async (req, res) => {
    try {
        const transacciones = await Entrada.find()
            .populate("usuario", "nombre apellido dni correo")
            .populate({
                path: "evento",
                select: "titulo precio artista sala",
                populate: { path: "sala", select: "nombre" }
            })
            .sort({ fechaCompra: -1 });

        res.render("admin/transacciones", {
            usuario: req.session.usuario,
            transacciones
        });
    } catch (error) {
        console.error("Error al obtener transacciones:", error);
        res.redirect("/admin/dashboard");
    }
};