import express from "express";
import { validarPago } from "../middlewares/validarPago.js";
import Entrada from "../models/Entrada.js";
import Evento from "../models/Evento.js";

const router = express.Router();

const estaLogueado = (req, res, next) => {
    if (req.session && req.session.usuario) {
        return next();
    }
    return res.status(401).json({ error: "⚠️ Debe iniciar sesión para realizar el pago." });
};

router.post("/procesar", estaLogueado, validarPago, async (req, res) => {
    try {
        const { titular, tarjeta, vencimiento, cvv, eventoId } = req.body;

        // Si no se envía el eventoId desde el formulario, buscamos uno disponible por defecto
        let idEventoFinal = eventoId;
        if (!idEventoFinal) {
            const eventoPrueba = await Evento.findOne();
            if (eventoPrueba) {
                idEventoFinal = eventoPrueba._id;
            } else {
                return res.status(400).json({ error: "⚠️ No hay eventos disponibles para asociar la entrada." });
            }
        }

        // 🟢 Creamos la entrada respetando estrictamente los campos del seed y modelo
        const nuevaEntrada = new Entrada({
            usuario: req.session.usuario._id || req.session.usuario.id,
            evento: idEventoFinal,
            cantidad: 1,
            metodoPago: "Tarjeta de Crédito", // Agregado porque tu modelo lo usa
            estado: "Valida",                 // El enum correcto según el error
            fechaCompra: new Date()
        });

        await nuevaEntrada.save();

        return res.status(200).json({ 
            success: true, 
            mensaje: "✅ ¡Pago aprobado y entrada registrada con éxito!" 
        });
    } catch (error) {
        console.error("Error al procesar el pago:", error);
        return res.status(500).json({ error: "❌ Error interno al registrar el pago: " + error.message });
    }
});

export default router;