import express from "express";
import { 
    renderLogin, 
    iniciarSesion, 
    renderRegistro, 
    registrarUsuario, 
    cerrarSesion 
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/login", renderLogin);
router.post("/login", iniciarSesion);

router.get("/registro", renderRegistro);
router.post("/registro", registrarUsuario);

router.get("/logout", cerrarSesion);

export default router;