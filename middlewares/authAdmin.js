import Usuario from "../models/Usuario.js";

export const verificarAdmin = async (req, res, next) => {
    try {
        // Leemos el ID que mandes desde los headers de Postman
        const usuarioId = req.headers['x-usuario-id'];
        
        if (!usuarioId) {
            return res.status(401).json({ error: "Falta identificar al usuario. Envíe el x-usuario-id en los headers." });
        }

        // Buscamos al usuario en la base de datos
        const usuario = await Usuario.findById(usuarioId);
        
        if (!usuario) {
            return res.status(404).json({ error: "El usuario indicado no existe." });
        }

        if (usuario.rol !== "Admin") {
            return res.status(403).json({ error: "Acceso denegado. Se requiere rol de Administrador." });
        }

        // Si es Admin, lo guardamos en la request por si el controlador lo necesita y lo dejamos pasar
        req.usuarioLogueado = usuario;
        next();

    } catch (error) {
        res.status(400).json({ error: "ID de usuario con formato inválido." });
    }
};