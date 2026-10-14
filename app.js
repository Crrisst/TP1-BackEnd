import crypto from "node:crypto";
globalThis.crypto = crypto; // Soluciona el error de criptografía de MongoDB en Node 18[cite: 18]

import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";

dotenv.config();

// Importar rutas modularizadas desde la ruta correcta (routes/)[cite: 18]
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import clienteRoutes from "./routes/cliente.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares obligatorios para formularios tradicionales y peticiones Fetch (JSON)
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.set("view engine", "pug");

app.use(session({
    secret: "clave_secreta_urbana_cult",
    resave: false,
    saveUninitialized: false
}));

// Montaje de rutas
app.use("/auth", authRoutes);       
app.use("/admin", adminRoutes);     
app.use("/cliente", clienteRoutes); 

// Ruta Raíz: Redirige al Login por seguridad
app.get("/", (req, res) => {
    res.redirect("/auth/login");
});

// ==========================================
// 🚪 RUTAS DE CERRAR SESIÓN (LOGOUT)
// ==========================================
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.redirect("/");
        }
        res.clearCookie("connect.sid"); 
        res.redirect("/auth/login"); 
    });
});

app.get("/auth/logout", (req, res) => {
    res.redirect("/logout");
});

// Conexión directa a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/urbana_cult")
    .then(() => {
        console.log("🟢 Conectado a MongoDB con éxito");
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error("🔴 Error al conectar a MongoDB:", err));