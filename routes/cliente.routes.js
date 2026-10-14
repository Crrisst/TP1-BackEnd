import express from "express";
import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";

const router = express.Router();

const esCliente = (req, res, next) => {
    if (req.session.usuario && (req.session.usuario.rol === "Cliente" || req.session.usuario.rol === "Admin")) {
        return next();
    }
    res.redirect("/auth/login");
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
        res.redirect("/cliente/cartelera");
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        res.redirect("/cliente/cartelera");
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

router.post("/carrito/eliminar/:id", (req, res) => {
    const { id } = req.params;
    if (req.session.carrito) {
        req.session.carrito = req.session.carrito.filter(itemId => itemId !== id);
    }
    res.redirect("/cliente/carrito");
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
            return res.redirect("/cliente/cartelera");
        }

        const { nombre, tarjetaNumero, tarjetaExpiracion, tarjetaCvv } = req.body;

        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        const soloNumerosRegex = /^\d+$/;
        const fechaExpRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

        let errorMensaje = null;

        if (!nombre || !soloLetrasRegex.test(nombre.trim())) {
            errorMensaje = "⚠️ El nombre del titular solo debe contener letras y espacios.";
        } else if (!tarjetaNumero || !soloNumerosRegex.test(tarjetaNumero) || tarjetaNumero.length < 13 || tarjetaNumero.length > 16) {
            errorMensaje = "⚠️ El número de tarjeta debe contener exclusivamente números (entre 13 y 16 dígitos).";
        } else if (!tarjetaExpiracion || !fechaExpRegex.test(tarjetaExpiracion.trim())) {
            errorMensaje = "⚠️ La fecha de expiración es inválida. Debe tener el formato MM/AA (ej. 12/28).";
        } else if (!tarjetaCvv || !soloNumerosRegex.test(tarjetaCvv) || (tarjetaCvv.length !== 3 && tarjetaCvv.length !== 4)) {
            errorMensaje = "⚠️ El código CVV debe ser exclusivamente numérico y tener exactamente 3 o 4 dígitos.";
        }

        if (errorMensaje) {
            const conteoIds = {};
            carritoIds.forEach(id => { conteoIds[id] = (conteoIds[id] || 0) + 1; });
            const eventosEnDb = await Evento.find({ _id: { $in: Object.keys(conteoIds) } }).populate("sala");
            
            let eventosAgrupados = eventosEnDb.map(ev => ({
                ...ev.toObject(),
                cantidad: conteoIds[ev._id.toString()] || 1,
                subtotal: ev.precio * (conteoIds[ev._id.toString()] || 1)
            }));
            const total = eventosAgrupados.reduce((acc, ev) => acc + ev.subtotal, 0);

            return res.render("cliente/checkout", {
                usuario: req.session.usuario,
                eventos: eventosAgrupados,
                total,
                error: errorMensaje
            });
        }

        const conteoIds = {};
        carritoIds.forEach(id => { conteoIds[id] = (conteoIds[id] || 0) + 1; });

        let eventosComprados = [];
        const fechaCompra = new Date();

        for (let eventoId of Object.keys(conteoIds)) {
            const eventoObj = await Evento.findById(eventoId).populate("sala");
            const cantidad = conteoIds[eventoId];

            await Entrada.create({
                usuario: req.session.usuario._id || req.session.usuario.id,
                evento: eventoId,
                cantidad: cantidad,
                metodoPago: "Tarjeta (Simulada)",
                estado: "Valida",
                fechaCompra: fechaCompra
            });

            if (eventoObj) {
                eventosComprados.push({
                    titulo: eventoObj.titulo,
                    artista: eventoObj.artista,
                    sala: eventoObj.sala ? eventoObj.sala.nombre : 'N/A',
                    precio: eventoObj.precio,
                    cantidad: cantidad,
                    subtotal: eventoObj.precio * cantidad
                });
            }
        }

        const totalPagado = eventosComprados.reduce((acc, ev) => acc + ev.subtotal, 0);
        const numeroOperacion = "UC-" + Math.floor(100000 + Math.random() * 900000);
        const ultimosDigitos = tarjetaNumero.slice(-4);

        req.session.carrito = [];

        res.render("cliente/factura", {
            usuario: req.session.usuario,
            eventos: eventosComprados,
            total: totalPagado,
            numeroOperacion,
            fecha: fechaCompra.toLocaleString(),
            ultimosDigitos,
            titular: nombre
        });
    } catch (error) {
        console.error("Error al procesar el pago:", error);
        res.redirect("/cliente/carrito");
    }
});

router.get("/entradas", async (req, res) => {
    try {
        const usuarioId = req.session.usuario._id || req.session.usuario.id;
        const entradas = await Entrada.find({ usuario: usuarioId })
            .populate({ path: "evento", populate: { path: "sala" } })
            .sort({ fechaCompra: -1 });

        res.render("cliente/mis-entradas", { usuario: req.session.usuario, entradas });
    } catch (error) {
        console.error("Error al cargar entradas:", error);
        res.redirect("/cliente/dashboard");
    }
});

router.get("/perfil", (req, res) => {
    res.render("cliente/editar-perfil", { usuario: req.session.usuario, exito: null, error: null });
});

router.post("/perfil", async (req, res) => {
    res.render("cliente/editar-perfil", { usuario: req.session.usuario, exito: "✅ Datos actualizados.", error: null });
});

export default router;