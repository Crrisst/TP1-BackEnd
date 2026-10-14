import express from "express";
import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";
import Usuario from "../models/Usuario.js";

const router = express.Router();

const esCliente = (req, res, next) => {
    if (req.session.usuario && (req.session.usuario.rol === "Cliente" || req.session.usuario.rol === "Admin")) {
        return next();
    }
    return res.status(401).json({ error: "No autorizado" });
};

router.use(esCliente);

router.get("/dashboard", (req, res) => {
    res.render("cliente/dashboard", { usuario: req.session.usuario });
});

router.get("/cartelera", async (req, res) => {
    try {
        const eventos = await Evento.find().populate("sala");
        const cantidadCarrito = req.session.carrito ? req.session.carrito.length : 0;
        const carritoIds = req.session.carrito || [];
        
        res.render("cliente/cartelera", { 
            usuario: req.session.usuario, 
            eventos,
            cantidadCarrito,
            carritoIds
        });
    } catch (error) {
        console.error("Error al cargar cartelera:", error);
        res.redirect("/cliente/dashboard");
    }
});

router.post("/carrito/agregar", async (req, res) => {
    try {
        const { eventoId } = req.body;
        if (!req.session.carrito) {
            req.session.carrito = [];
        }
        req.session.carrito.push(eventoId);
        
        return res.status(200).json({
            mensaje: "¡Entrada agregada al carrito con éxito!",
            cantidadCarrito: req.session.carrito.length
        });
    } catch (error) {
        return res.status(500).json({ error: "No se pudo agregar al carrito." });
    }
});

router.get("/carrito", async (req, res) => {
    try {
        const carritoIds = req.session.carrito || [];
        const conteoIds = {};
        carritoIds.forEach(id => {
            conteoIds[id] = (conteoIds[id] || 0) + 1;
        });

        const unicosIds = Object.keys(conteoIds);
        const eventosEnDb = await Evento.find({ _id: { $in: unicosIds } }).populate("sala");

        let eventosAgrupados = eventosEnDb.map(ev => {
            const cantidad = conteoIds[ev._id.toString()] || 1;
            return {
                ...ev.toObject(),
                cantidad,
                subtotal: ev.precio * cantidad
            };
        });

        const total = eventosAgrupados.reduce((acc, ev) => acc + ev.subtotal, 0);

        res.render("cliente/carrito", {
            usuario: req.session.usuario,
            eventos: eventosAgrupados,
            total
        });
    } catch (error) {
        console.error("Error al cargar el carrito:", error);
        res.redirect("/cliente/cartelera");
    }
});

router.post("/carrito/eliminar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (req.session.carrito) {
            req.session.carrito = req.session.carrito.filter(itemId => itemId !== id);
        }
        
        const eventosEnDb = await Evento.find({ _id: { $in: req.session.carrito } });
        const nuevoTotal = eventosEnDb.reduce((acc, ev) => acc + ev.precio, 0);

        return res.status(200).json({
            nuevoTotal,
            eventosRestantes: req.session.carrito.length
        });
    } catch (error) {
        return res.status(500).json({ error: "Error al eliminar." });
    }
});

router.get("/checkout", async (req, res) => {
    try {
        const carritoIds = req.session.carrito || [];
        if (carritoIds.length === 0) {
            return res.redirect("/cliente/carrito");
        }

        const conteoIds = {};
        carritoIds.forEach(id => { conteoIds[id] = (conteoIds[id] || 0) + 1; });
        const eventosEnDb = await Evento.find({ _id: { $in: Object.keys(conteoIds) } }).populate("sala");
        
        let eventosAgrupados = eventosEnDb.map(ev => ({
            ...ev.toObject(),
            cantidad: conteoIds[ev._id.toString()] || 1,
            subtotal: ev.precio * (conteoIds[ev._id.toString()] || 1)
        }));

        const total = eventosAgrupados.reduce((acc, ev) => acc + ev.subtotal, 0);

        res.render("cliente/checkout", {
            usuario: req.session.usuario,
            eventos: eventosAgrupados,
            total,
            error: null
        });
    } catch (error) {
        console.error("Error al cargar el checkout:", error);
        res.redirect("/cliente/carrito");
    }
});

router.post("/checkout/procesar", async (req, res) => {
    try {
        const carritoIds = req.session.carrito || [];
        if (carritoIds.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío." });
        }

        const { nombre, tarjetaNumero, tarjetaExpiracion, tarjetaCvv } = req.body;

        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        const soloNumerosRegex = /^\d+$/;
        const fechaExpRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

        if (!nombre || !soloLetrasRegex.test(nombre.trim())) {
            return res.status(400).json({ error: "⚠️ El nombre del titular solo debe contener letras." });
        }
        if (!tarjetaNumero || !soloNumerosRegex.test(tarjetaNumero) || tarjetaNumero.length < 13 || tarjetaNumero.length > 16) {
            return res.status(400).json({ error: "⚠️ Número de tarjeta inválido (13 a 16 dígitos)." });
        }
        if (!tarjetaExpiracion || !fechaExpRegex.test(tarjetaExpiracion.trim())) {
            return res.status(400).json({ error: "⚠️ La fecha de expiración debe tener el formato MM/AA." });
        }
        if (!tarjetaCvv || !soloNumerosRegex.test(tarjetaCvv) || (tarjetaCvv.length !== 3 && tarjetaCvv.length !== 4)) {
            return res.status(400).json({ error: "⚠️ El código CVV debe tener 3 o 4 dígitos numéricos." });
        }

        const conteoIds = {};
        carritoIds.forEach(id => { conteoIds[id] = (conteoIds[id] || 0) + 1; });

        const fechaCompra = new Date();

        for (let eventoId of Object.keys(conteoIds)) {
            const cantidad = conteoIds[eventoId];
            await Entrada.create({
                usuario: req.session.usuario._id || req.session.usuario.id,
                evento: eventoId,
                cantidad: cantidad,
                metodoPago: "Tarjeta (Simulada)",
                estado: "Valida",
                fechaCompra: fechaCompra
            });
        }

        req.session.carrito = [];

        return res.status(200).json({ 
            success: true, 
            redirectUrl: "/cliente/entradas" 
        });
    } catch (error) {
        console.error("Error al procesar el pago:", error);
        return res.status(500).json({ error: "❌ Error al procesar la transacción." });
    }
});

router.get("/entradas", async (req, res) => {
    try {
        const usuarioId = req.session.usuario._id || req.session.usuario.id;
        
        // Búsqueda robusta asegurando la relación con el evento y su sala
        const entradas = await Entrada.find({ usuario: usuarioId })
            .populate({ 
                path: "evento", 
                populate: { path: "sala" } 
            })
            .sort({ fechaCompra: -1 });

        res.render("cliente/mis-entradas", { 
            usuario: req.session.usuario, 
            entradas: entradas || [] 
        });
    } catch (error) {
        console.error("❌ Error detallado al cargar entradas:", error);
        res.render("cliente/mis-entradas", { 
            usuario: req.session.usuario, 
            entradas: [] 
        });
    }
});

router.get("/perfil", (req, res) => {
    res.render("cliente/editar-perfil", { usuario: req.session.usuario, exito: null, error: null });
});

router.post("/perfil", async (req, res) => {
    try {
        const usuarioId = req.session.usuario._id || req.session.usuario.id;
        const { nombre, apellido, dni, correo, password } = req.body;

        if (!nombre || nombre.trim().length > 15 || !apellido || apellido.trim().length > 15) {
            return res.status(400).json({ error: "⚠️ El nombre y apellido no deben superar los 15 caracteres." });
        }

        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!soloLetrasRegex.test(nombre.trim()) || !soloLetrasRegex.test(apellido.trim())) {
            return res.status(400).json({ error: "⚠️ El nombre y apellido deben contener únicamente letras." });
        }

        const dniExistente = await Usuario.findOne({ _id: { $ne: usuarioId }, dni: dni.trim() });
        if (dniExistente) {
            return res.status(400).json({ error: "⚠️ El DNI ya se encuentra registrado por otro usuario." });
        }

        const correoExistente = await Usuario.findOne({ _id: { $ne: usuarioId }, correo: correo.trim() });
        if (correoExistente) {
            return res.status(400).json({ error: "⚠️ El correo electrónico ya se encuentra registrado." });
        }

        const datosActualizados = {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            dni: dni.trim(),
            correo: correo.trim()
        };

        if (password && password.trim() !== "") {
            datosActualizados.password = password;
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            usuarioId,
            datosActualizados,
            { new: true }
        );

        req.session.usuario = usuarioActualizado;

        return res.status(200).json({ mensaje: "✅ Tus datos han sido actualizados con éxito." });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return res.status(500).json({ error: "❌ Ocurrió un error al intentar guardar tus datos." });
    }
});

export default router;