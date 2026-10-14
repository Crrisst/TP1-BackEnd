import Usuario from "../models/Usuario.js";

// Ya no redirige automáticamente al entrar a la raíz, siempre muestra el login
export const renderLogin = (req, res, next) => {
    try {
        res.render("login", { error: null });
    } catch (error) { next(error); }
};

export const iniciarSesion = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const usuario = await Usuario.findOne({ username, password });

        if (!usuario) {
            return res.render("login", { error: "Usuario o contraseña incorrectos." });
        }

        // Guardar sesión
        req.session.usuario = usuario;

        // Redirigir según el rol del usuario solo al hacer submit en el login
        if (["Admin", "Administrador", "Supervisor"].includes(usuario.rol)) {
            return res.redirect("/admin");
        } else {
            return res.redirect("/cartelera");
        }
    } catch (error) { next(error); }
};

export const cerrarSesion = (req, res, next) => {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
};