import Usuario from "../models/Usuario.js";

// Renderizar Vista de Login
export const renderLogin = (req, res) => {
    res.render("auth/login", { error: null });
};

// Procesar Login (Fetch)
export const iniciarSesion = async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuario = await Usuario.findOne({ username, password });

        if (!usuario) {
            return res.status(401).json({ error: "⚠️ Usuario o contraseña incorrectos." });
        }

        req.session.usuario = usuario;

        const redirectUrl = (["Admin", "Administrador", "Supervisor"].includes(usuario.rol))
            ? "/admin"
            : "/cliente/cartelera";

        return res.status(200).json({ redirectUrl });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "⚠️ Ocurrió un error al iniciar sesión." });
    }
};

// Renderizar Vista de Registro
export const renderRegistro = (req, res) => {
    res.render("auth/registro", { error: null });
};

// Procesar Registro (Fetch)
export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellido, dni, correo, cumpleaños, username, password } = req.body;

        if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username || !password) {
            return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios." });
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
            return res.status(400).json({ error: "⚠️ El nombre de usuario (username) ya está en uso." });
        }

        const nuevoUsuario = new Usuario({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dni: dni.trim(),
            correo: correo.trim(),
            cumpleaños,
            username: username.trim(),
            password,
            rol: "Cliente"
        });

        await nuevoUsuario.save();

        return res.status(200).json({ 
            success: true, 
            mensaje: "¡Registro exitoso!", 
            redirectUrl: "/auth/login" 
        });
    } catch (error) {
        console.error("Error en registro:", error);
        return res.status(500).json({ error: "❌ Ocurrió un error al registrar el usuario." });
    }
};

// Cerrar Sesión
export const cerrarSesion = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.redirect("/");
        }
        res.clearCookie("connect.sid");
        res.redirect("/auth/login");
    });
};