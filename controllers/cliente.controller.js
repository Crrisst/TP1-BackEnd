import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";
import Usuario from "../models/Usuario.js";

// Dashboard Cliente
export const renderDashboardCliente = (req, res) => {
    res.render("cliente/dashboard", { usuario: req.session.usuario });
};

// Cartelera
export const renderCarteleraCliente = async (req, res) => {
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
};

// Carrito (Valida contra el stock actual sin descontarlo prematuramente)
export const agregarAlCarrito = async (req, res) => {
    try {
        const { eventoId } = req.body;
        const evento = await Evento.findById(eventoId);

        if (!evento) {
            return res.status(404).json({ error: "⚠️ El evento no existe." });
        }

        const stockTotal = evento.entradasDisponibles !== undefined ? evento.entradasDisponibles : 0;

        if (!req.session.carrito) {
            req.session.carrito = [];
        }
        
        const cantidadEnCarrito = req.session.carrito.filter(id => id === eventoId).length;

        if (cantidadEnCarrito >= stockTotal) {
            return res.status(400).json({ error: "⚠️ Has alcanzado el límite de entradas disponibles para este evento." });
        }

        req.session.carrito.push(eventoId);
        
        return res.status(200).json({
            mensaje: "¡Entrada agregada al carrito con éxito!",
            cantidadCarrito: req.session.carrito.length
        });
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        return res.status(500).json({ error: "No se pudo agregar al carrito." });
    }
};

export const renderCarrito = async (req, res) => {
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
};

export const eliminarDelCarrito = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.session.carrito) {
            req.session.carrito = req.session.carrito.filter(itemId => itemId !== id);
        }
        
        const eventosEnDb = await Evento.find({ _id: { $in: req.session.carrito || [] } }).populate("sala");
        let eventosAgrupados = eventosEnDb.map(ev => {
            const cantidad = req.session.carrito.filter(itemId => itemId === ev._id.toString()).length;
            return { ...ev.toObject(), subtotal: ev.precio * cantidad };
        });
        const nuevoTotal = eventosAgrupados.reduce((acc, ev) => acc + ev.subtotal, 0);

        return res.status(200).json({
            nuevoTotal,
            eventosRestantes: req.session.carrito ? req.session.carrito.length : 0
        });
    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        return res.status(500).json({ error: "Error al eliminar." });
    }
};

// Checkout
export const renderCheckout = async (req, res) => {
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
};

// Procesamiento de Pago (Aquí se descuenta el stock real y se generan las entradas)
export const procesarPagoCheckout = async (req, res) => {
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

        for (let eventoId of Object.keys(conteoIds)) {
            const cantidadRequerida = conteoIds[eventoId];
            const eventoDb = await Evento.findById(eventoId);
            
            if (!eventoDb || eventoDb.entradasDisponibles < cantidadRequerida) {
                return res.status(400).json({ error: `⚠️ Lo sentimos, el evento "${eventoDb ? eventoDb.titulo : ''}" ya no cuenta con stock suficiente.` });
            }
        }

        const fechaCompra = new Date();

        for (let eventoId of Object.keys(conteoIds)) {
            const cantidad = conteoIds[eventoId];
            
            await Evento.findByIdAndUpdate(eventoId, {
                $inc: { entradasDisponibles: -cantidad }
            });

            await Entrada.create({
                usuario: req.session.usuario._id || req.session.usuario.id,
                evento: eventoId,
                cantidad: cantidad,
                metodoPago: "Tarjeta de Crédito",
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
};

// Mis Entradas
export const renderMisEntradas = async (req, res) => {
    try {
        const usuarioId = req.session.usuario._id || req.session.usuario.id;
        
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
        console.error("❌ Error al cargar entradas:", error);
        res.render("cliente/mis-entradas", { 
            usuario: req.session.usuario, 
            entradas: [] 
        });
    }
};

// Perfil
export const renderPerfil = (req, res) => {
    res.render("cliente/editar-perfil", { usuario: req.session.usuario, exito: null, error: null });
};

export const actualizarPerfil = async (req, res) => {
    try {
        const usuarioId = req.session.usuario._id || req.session.usuario.id;
        const { nombre, apellido, dni, correo, password } = req.body;

        if (!nombre || nombre.trim().length > 15 || !apellido || apellido.trim().length > 15) {
            return res.status(400).json({ error: "⚠️ El nombre y apellido no deben superar los 15 caracteres." });
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
};