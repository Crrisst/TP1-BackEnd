import Evento from "../models/Evento.js";
import Sala from "../models/Sala.js";

// Renderizar la Cartelera Principal con Pug
export const renderCartelera = async (req, res, next) => {
    try {
        const eventos = await Evento.find({ estado: "Proximo" }).populate("sala");
        res.render("cartelera", { eventos });
    } catch (error) {
        next(error);
    }
};

// Crear evento
export const crearEvento = async (req, res, next) => {
    try {
        const salaExiste = await Sala.findById(req.body.sala);
        if (!salaExiste) {
            const error = new Error("La sala indicada no existe.");
            error.status = 400;
            throw error;
        }
        
        await Evento.create(req.body);
        res.redirect("/");
    } catch (error) { 
        next(error); 
    }
};