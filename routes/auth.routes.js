import express from "express";
import Usuario from "../models/Usuario.js";

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("auth/login", { error: null });
});

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

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.redirect("/auth/login");
    });
});

export default router;