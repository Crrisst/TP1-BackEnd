import express from "express";
import { 
    renderDashboardAdmin,
    renderUsuariosAdmin,
    crearUsuarioAdmin,
    editarUsuarioAdmin,
    eliminarUsuarioAdmin,
    renderSalasAdmin,
    crearSalaAdmin,
    eliminarSalaAdmin,
    renderEventosAdmin,
    crearEventoAdmin,
    eliminarEventoAdmin,
    renderTransaccionesAdmin
} from "../controllers/admin.controller.js";
import { validarSala, validarUsuario, validarEvento } from "../middlewares/validadores.js";

const router = express.Router();

const esAdmin = (req, res, next) => {
    if (req.session.usuario && ["Admin", "Administrador", "Supervisor"].includes(req.session.usuario.rol)) {
        return next();
    }
    return res.status(401).json({ error: "No autorizado" });
};

router.use(esAdmin);


router.get("/", renderDashboardAdmin);
router.get("/dashboard", renderDashboardAdmin);


router.get("/usuarios", renderUsuariosAdmin);
router.post("/usuarios", validarUsuario, crearUsuarioAdmin);
router.post("/usuarios/editar/:id", editarUsuarioAdmin);
router.post("/usuarios/eliminar/:id", eliminarUsuarioAdmin);


router.get("/salas", renderSalasAdmin);
router.post("/salas", validarSala, crearSalaAdmin);
router.post("/salas/eliminar/:id", eliminarSalaAdmin);


router.get("/eventos", renderEventosAdmin);
router.post("/eventos", validarEvento, crearEventoAdmin);
router.post("/eventos/eliminar/:id", eliminarEventoAdmin);

router.get("/transacciones", renderTransaccionesAdmin);

export default router;