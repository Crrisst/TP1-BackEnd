import express from 'express';
import { procesarLogin, registrarCliente } from '../controllers/authController.js';  

const router = express.Router();

// Ruta para mostrar la vista de inicio de sesión
router.get('/login', (req, res) => {
  res.render('auth/login', { error: req.query.error || null });
});

router.post('/login', procesarLogin);

// Rutas de registro (Soporta tanto /register como /registro)
router.get('/register', (req, res) => {
  res.render('auth/registro', { error: req.query.error || null });
});

router.get('/registro', (req, res) => {
  res.render('auth/registro', { error: req.query.error || null });
});

router.post('/register', registrarCliente);
router.post('/registro', registrarCliente); // Alias por si el formulario apunta a /auth/registro

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

export default router;