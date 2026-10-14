import express from "express";
import {
    renderDashboardCliente,
    renderCarteleraCliente,
    agregarAlCarrito,
    renderCarrito,
    eliminarDelCarrito,
    renderCheckout,
    procesarPagoCheckout,
    renderMisEntradas,
    renderPerfil,
    actualizarPerfil
} from "../controllers/cliente.controller.js";

const router = express.Router();

const esCliente = (req, res, next) => {
    if (req.session.usuario && (req.session.usuario.rol === "Cliente" || req.session.usuario.rol === "Admin")) {
        return next();
    }
    return res.status(401).json({ error: "No autorizado" });
};

router.use(esCliente);

router.get("/dashboard", renderDashboardCliente);
router.get("/cartelera", renderCarteleraCliente);

router.post("/carrito/agregar", agregarAlCarrito);
router.get("/carrito", renderCarrito);
router.post("/carrito/eliminar/:id", eliminarDelCarrito);

router.get("/checkout", renderCheckout);
router.post("/checkout/procesar", procesarPagoCheckout);

router.get("/entradas", renderMisEntradas);

router.get("/perfil", renderPerfil);
router.post("/perfil", actualizarPerfil);

export default router;