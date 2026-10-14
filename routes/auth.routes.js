import express from "express";
import Usuario from "../models/Usuario.js";

const router = express.Router();

// ==========================================
// 🔐 VISTA Y PROCESAMIENTO DE LOGIN
// ==========================================
router.get("/login", (req, res) => {
    if (req.session.usuario) {
        if (req.session.usuario.rol === "Admin" || req.session.usuario.rol === "Administrador") {
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/cliente/dashboard"); 
        }
    }
    res.render("auth/login", { error: null });
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const usuarioEncontrado = await Usuario.findOne({ username, password });

        if (!usuarioEncontrado) {
            return res.render("auth/login", { error: "❌ Usuario o contraseña incorrectos." });
        }

        req.session.usuario = usuarioEncontrado;

        if (usuarioEncontrado.rol === "Admin" || usuarioEncontrado.rol === "Administrador") {
            return res.redirect("/admin/dashboard");
        } else {
            return res.redirect("/cliente/dashboard"); 
        }
    } catch (error) {
        console.error("Error en el login:", error);
        res.render("auth/login", { error: "❌ Ocurrió un error en el servidor." });
    }
});

// ==========================================
// 📝 REGISTRO DE NUEVOS CLIENTES
// ==========================================
router.get("/registro", (req, res) => {
    if (req.session.usuario) {
        return res.redirect("/cliente/dashboard");
    }
    res.render("auth/registro", { error: null, datos: null });
});

router.post("/registro", async (req, res) => {
    try {
        const { nombre, apellido, dni, correo, cumpleaños, username, password } = req.body;

        const renderError = (mensaje) => {
            return res.render("auth/registro", { 
                error: mensaje, 
                datos: req.body 
            });
        };

        // 1. Campos obligatorios
        if (!nombre || !apellido || !dni || !correo || !cumpleaños || !username || !password) {
            return renderError("⚠️ Todos los campos del formulario son obligatorios.");
        }

        // 2. Control estricto de longitud máxima (Nombre y Apellido máx. 15 caracteres)
        if (nombre.trim().length > 15) {
            return renderError("⚠️ El nombre no puede superar los 15 caracteres.");
        }
        if (apellido.trim().length > 15) {
            return renderError("⚠️ El apellido no puede superar los 15 caracteres.");
        }
        if (username.trim().length > 30) {
            return renderError("⚠️ El nombre de usuario no puede superar los 30 caracteres.");
        }

        // 3. Nombre y Apellido solo letras
        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!soloLetrasRegex.test(nombre) || !soloLetrasRegex.test(apellido)) {
            return renderError("⚠️ El nombre y el apellido deben contener únicamente letras.");
        }

        // 4. DNI numérico de 7 u 8 dígitos
        const dniRegex = /^\d{7,8}$/;
        if (!dniRegex.test(dni)) {
            return renderError("⚠️ El DNI debe ser numérico y tener entre 7 y 8 dígitos.");
        }

        // 5. Formato de correo electrónico válido
        const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoRegex.test(correo)) {
            return renderError("⚠️ El formato del correo electrónico no es válido.");
        }

        // 6. Validación de fecha y mayoría de edad (+18 años)
        let fechaNacimiento = new Date(cumpleaños);
        if (isNaN(fechaNacimiento.getTime())) {
            return renderError("⚠️ La fecha de cumpleaños ingresada no es válida.");
        }

        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
            edad--;
        }

        if (edad < 18) {
            return renderError("❌ El usuario debe ser mayor de edad (18 años o más) para registrarse.");
        }

        // 7. Verificación de unicidad en la Base de Datos
        const dniExistente = await Usuario.findOne({ dni });
        if (dniExistente) {
            return renderError("⚠️ El DNI ingresado ya se encuentra registrado en el sistema.");
        }

        const correoExistente = await Usuario.findOne({ correo });
        if (correoExistente) {
            return renderError("⚠️ El correo electrónico ingresado ya se encuentra registrado.");
        }

        const usernameExistente = await Usuario.findOne({ username });
        if (usernameExistente) {
            return renderError("⚠️ El nombre de usuario (username) ya está en uso. Elija otro.");
        }

        // 8. Crear el nuevo usuario con rol de Cliente
        const nuevoCliente = new Usuario({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dni: dni.trim(),
            correo: correo.trim(),
            cumpleaños,
            username: username.trim(),
            password,
            rol: "Cliente"
        });

        await nuevoCliente.save();

        // Autenticar automáticamente al nuevo cliente
        req.session.usuario = nuevoCliente;
        res.redirect("/cliente/dashboard");

    } catch (error) {
        console.error("Error en el registro:", error);
        res.render("auth/registro", { 
            error: "❌ Error interno al procesar el registro en la base de datos.", 
            datos: req.body 
        });
    }
});

export default router;