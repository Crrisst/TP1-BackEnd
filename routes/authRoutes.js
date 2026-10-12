import express from 'express';
import { procesarLogin, registrarCliente } from '../controllers/authController.js';  
import { validarRegistro } from '../middlewares/validacionesMiddleware.js';

const router = express.Router();

// Vista de Login
router.get('/login', (req, res) => {
  res.render('auth/login', { error: req.query.error || null });
});

router.post('/login', procesarLogin);

// Vista de Registro
const renderRegistro = (req, res) => {
  res.render('auth/registro', { error: req.query.error || null, datos: {} });
};

router.get('/register', renderRegistro);
router.get('/registro', renderRegistro);

// Procesar Registro (pasa por la validación de edad y fecha)
router.post('/register', validarRegistro, registrarCliente);
router.post('/registro', validarRegistro, registrarCliente);

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

export default router;