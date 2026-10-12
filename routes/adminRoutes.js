import express from 'express';
import { 
  mostrarFormularioCrearPersonal, 
  registrarPersonalInterno, 
  listarUsuarios, 
  mostrarFormularioEditarUsuario, 
  actualizarUsuario, 
  eliminarUsuario, 
  listarAuditoriaPagos,
  listarCancelaciones
} from '../controllers/adminController.js';
import { 
  getEventos, 
  actualizarEntidad, 
  eliminarEntidad 
} from '../controllers/eventosController.js';
import { verificarRol } from '../middlewares/authMiddleware.js';
import Entidad from '../models/Entidad.js';

import  { mostrarGestionEntradas } from '../controllers/entradasController.js';

const router = express.Router();

// Dashboard general (Administrador, Supervisor, Lector)
router.get('/dashboard', verificarRol(['Administrador', 'Supervisor', 'Lector']), (req, res) => {
  res.render('Admin/dashboard', {
    usuarioLogueado: req.session.usuario,
    mensajeExito: req.query.exito || null
  });
});

// Gestión de Usuarios (Visualización para Admin/Supervisor/Lector, Modificación solo Admin)
router.get('/usuarios', verificarRol(['Administrador', 'Supervisor', 'Lector']), listarUsuarios);
router.get('/crear-personal', verificarRol(['Administrador']), mostrarFormularioCrearPersonal);
router.post('/crear-personal', verificarRol(['Administrador']), registrarPersonalInterno);
router.get('/usuarios/editar/:id', verificarRol(['Administrador']), mostrarFormularioEditarUsuario);
router.post('/usuarios/editar/:id', verificarRol(['Administrador']), actualizarUsuario);
router.post('/usuarios/eliminar/:id', verificarRol(['Administrador']), eliminarUsuario);

// 💳 Auditoría de Compras y Pagos
router.get('/compras', verificarRol(['Administrador', 'Supervisor', 'Lector']), listarAuditoriaPagos);

// 🚫 Auditoría de Cancelaciones
router.get('/cancelaciones', verificarRol(['Administrador', 'Supervisor', 'Lector']), listarCancelaciones);

// Gestión de Artistas / Entidades
router.get('/entidades', verificarRol(['Administrador', 'Supervisor', 'Lector']), async (req, res) => {
  try {
    const entidades = await Entidad.find().sort({ nombre: 1 });
    res.render('Admin/entidades', {
      usuarioLogueado: req.session.usuario,
      entidades,
      exito: req.query.exito || null,
      error: req.query.error || null
    });
  } catch (error) {
    res.status(500).send('Error al cargar entidades.');
  }
});

router.get('/entradas', verificarRol(['Administrador', 'Supervisor', 'Lector']), mostrarGestionEntradas);

// 🔒 Edición y Eliminación restringidas solo a Administrador y Supervisor (Lector rebotará con 403)
router.post('/entidades/editar/:id', verificarRol(['Administrador', 'Supervisor']), actualizarEntidad);
router.post('/entidades/eliminar/:id', verificarRol(['Administrador', 'Supervisor']), eliminarEntidad);

export default router;