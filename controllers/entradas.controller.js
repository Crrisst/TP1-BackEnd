import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";
import Usuario from "../models/Usuario.js";

// Vender Entrada (Público)
export const venderEntrada = async (req, res, next) => {
    try {
        const { eventoId, usuarioId, cantidad } = req.body;
        const cant = parseInt(cantidad) || 1;

        const evento = await Evento.findById(eventoId).populate("sala");
        const usuario = await Usuario.findById(usuarioId);

        if (!evento) return res.status(404).json({ error: "El evento no existe." });
        if (!usuario) return res.status(404).json({ error: "El usuario no existe." });
        
        // Regla: Evento finalizado no permite ventas
        if (evento.estado === "Finalizado" || new Date(evento.fecha) < new Date()) {
            return res.status(403).json({ error: "No se pueden comprar entradas, el evento ya finalizó." });
        }

        // Regla: Validar capacidad máxima de la sala (Protegido contra undefined usando || 0)
        const entradasActuales = evento.entradasVendidas || 0;
        if ((entradasActuales + cant) > evento.sala.capacidad) {
            return res.status(400).json({ 
                error: "Capacidad máxima superada.",
                disponibles: evento.sala.capacidad - entradasActuales
            });
        }

        // Crear entrada y sumar venta
        const nuevaEntrada = await Entrada.create({ 
            evento: eventoId, 
            usuario: usuarioId, 
            cantidad: cant 
        });
        
        evento.entradasVendidas = entradasActuales + cant;
        await evento.save();

        res.status(201).json({ mensaje: "Compra exitosa", entrada: nuevaEntrada });
    } catch (error) { next(error); }
};

// Cancelar Entrada (Solo Admin) - Libera el cupo
export const cancelarEntrada = async (req, res, next) => {
    try {
        const entrada = await Entrada.findById(req.params.id);
        if (!entrada) return res.status(404).json({ error: "Entrada no encontrada." });
        if (entrada.estado === "Cancelada") return res.status(400).json({ error: "La entrada ya fue cancelada previamente." });

        // Cambiar estado a Cancelada
        entrada.estado = "Cancelada";
        await entrada.save();

        // Regla de negocio: Liberar el cupo en el Evento
        const evento = await Evento.findById(entrada.evento);
        if (evento) {
            evento.entradasVendidas = Math.max(0, (evento.entradasVendidas || 0) - entrada.cantidad);
            await evento.save();
        }

        res.status(200).json({ mensaje: "Entrada cancelada con éxito. Cupos liberados." });
    } catch (error) { next(error); }
};