import express from "express";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// Renderizar Vista de Login
router.get("/login", (req, res) => {
    res.render("auth/login", { error: null });
});

// Procesar Login con Fetch
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuario = await Usuario.findOne({ username, password });

        if (!usuario) {
            return res.status(401).json({ error: "⚠️ Usuario o contraseña incorrectos." });
        }

        req.session.usuario = usuario;

        const redirectUrl = (usuario.rol === "Admin" || usuario.rol === "Administrador")
            ? "/admin"
            : "/cliente/cartelera";

        return res.status(200).json({ redirectUrl });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: "⚠️ Ocurrió un error al iniciar sesión." });
    }
});

// ==========================================
// 📝 RUTAS DE REGISTRO DE CLIENTES
// ==========================================

// Renderizar Vista de Registro (Ajustado a "auth/registro" para evitar el error de lookup)
router.get("/registro", (req, res) => {
    try {
        res.render("auth/registro", { error: null }); 
    } catch (error) {
        res.status(500).render("auth/login", { error: "Error al cargar la vista de registro." });
    }
});

// Procesar Registro vía Fetch
router.post("/registro", async (req, res) => {
    try {
        const { nombre, apellido, dni, correo, cumpleaños, username, password } = req.body;

        if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username || !password) {
            return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios." });
        }

        // Validar DNI único
        const dniExistente = await Usuario.findOne({ dni: dni.trim() });
        if (dniExistente) {
            return res.status(400).json({ error: "⚠️ El DNI ingresado ya se encuentra registrado." });
        }

        // Validar Correo único
        const correoExistente = await Usuario.findOne({ correo: correo.trim() });
        if (correoExistente) {
            return res.status(400).json({ error: "⚠️ El correo electrónico ya está en uso." });
        }

        // Validar Username único
        const usernameExistente = await Usuario.findOne({ username: username.trim() });
        if (usernameExistente) {
            return res.status(400).json({ error: "⚠️ El nombre de usuario (username) ya está en uso." });
        }

        // Crear el nuevo usuario con rol de Cliente por defecto
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
});

// Cerrar Sesión
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/auth/login");
    });
});

export default router;