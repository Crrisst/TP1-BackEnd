import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";

export const renderCartelera = async (req, res, next) => {
    try {
        const eventos = await Evento.find().populate("sala");
        res.render("cliente/cartelera", { 
            usuario: req.session.usuario || null, 
            eventos,
            exito: req.query.exito || null,
            error: req.query.error || null
        });
    } catch (error) { next(error); }
};

export const comprarEntrada = async (req, res, next) => {
    try {
        if (!req.session.usuario) {
            return res.redirect("/");
        }

        const { eventoId } = req.body;
        const evento = await Evento.findById(eventoId).populate("sala");

        if (!evento) {
            return res.redirect("/cartelera?error=El evento no existe.");
        }

        // Crear la entrada
        await Entrada.create({
            evento: eventoId,
            usuario: req.session.usuario._id,
            cantidad: 1
        });

        // Incrementar el contador de entradas vendidas del evento
        evento.entradasVendidas = (evento.entradasVendidas || 0) + 1;
        await evento.save();

        res.redirect("/cartelera?exito=¡Entrada comprada con éxito!");
    } catch (error) { next(error); }
};

export const renderMisEntradas = async (req, res, next) => {
    try {
        if (!req.session.usuario) {
            return res.redirect("/");
        }

        // Buscar las entradas del usuario actual ordenadas por fecha de compra
        const entradas = await Entrada.find({ usuario: req.session.usuario._id })
            .populate({
                path: "evento",
                populate: { path: "sala" }
            })
            .sort({ fechaCompra: -1 });

        res.render("cliente/mis-entradas", { 
            usuario: req.session.usuario, 
            entradas 
        });
    } catch (error) { next(error); }
};