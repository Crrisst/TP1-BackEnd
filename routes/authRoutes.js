import express from 'express';
import { procesarLogin, registrarCliente } from '../controllers/authController.js';  

const router = express.Router();

// Ruta para mostrar la vista de inicio de sesión
router.get('/login', (req, res) => {
  res.render('auth/login', { error: req.query.error || null });
});

router.post('/login', procesarLogin);

// Rutas de registro unificadas (Soporta /register y /registro renderizando la misma vista)
const renderRegistro = (req, res) => {
  res.render('auth/registro', { error: req.query.error || null, datos: {} });
};

router.get('/register', renderRegistro);
router.get('/registro', renderRegistro);

router.post('/register', registrarCliente);
router.post('/registro', registrarCliente);

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

export default router;