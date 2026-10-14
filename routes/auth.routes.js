import express from "express";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// ==========================================
// 🔐 VISTA DE LOGIN
// ==========================================
router.get("/login", (req, res) => {
    // Si ya hay una sesión activa, redirigir según su rol
    if (req.session.usuario) {
        if (req.session.usuario.rol === "Admin" || req.session.usuario.rol === "Administrador") {
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/cliente/dashboard"); 
        }
    }
    res.render("login", { error: null }); // 👈 Cambiado de "auth/login" a "login"
});

// ==========================================
// 🚀 PROCESAR LOGIN
// ==========================================
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const usuarioEncontrado = await Usuario.findOne({ username, password });

        if (!usuarioEncontrado) {
            return res.render("login", { error: "❌ Usuario o contraseña incorrectos." }); // 👈 Cambiado aquí también
        }

        // Guardamos los datos del usuario en la sesión
        req.session.usuario = usuarioEncontrado;

        // Redirección según el rol del usuario
        if (usuarioEncontrado.rol === "Admin" || usuarioEncontrado.rol === "Administrador") {
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/cliente/dashboard"); 
        }
    } catch (error) {
        console.error("Error en el login:", error);
        res.render("login", { error: "❌ Ocurrió un error en el servidor." }); // 👈 Cambiado aquí también
    }
});

export default router;