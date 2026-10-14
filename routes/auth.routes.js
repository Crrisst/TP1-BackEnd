import express from "express";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// Mostrar vista de Login
router.get("/login", (req, res) => {
    res.render("login", { error: null });
});

// Procesar el Login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuario = await Usuario.findOne({ username, password });

        if (!usuario) {
            return res.render("login", { error: "⚠️ Usuario o contraseña incorrectos." });
        }

        // Guardar usuario en sesión
        req.session.usuario = usuario;

        // Redirigir según el rol del usuario
        if (usuario.rol === "Admin" || usuario.rol === "Administrador") {
            return res.redirect("/admin");
        } else {
            return res.redirect("/cliente/cartelera");
        }
    } catch (error) {
        console.error(error);
        res.render("login", { error: "⚠️ Ocurrió un error al iniciar sesión." });
    }
});

// Cerrar sesión
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/auth/login");
    });
});

export default router;