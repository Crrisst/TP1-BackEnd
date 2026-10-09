// index.js
const crypto = require('crypto');
if (!global.crypto) {
  global.crypto = crypto;
}

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB (Base de datos TP2)
mongoose.connect('mongodb://localhost:27017/TP2')
  .then(() => console.log('✅ Conectado a MongoDB (TP2)'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Configuraciones de Express
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones
app.use(session({
  secret: 'secreto_super_seguro_tp2',
  resave: false,
  saveUninitialized: false
}));

// Importación de Rutas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const carritoRoutes = require('./routes/carritoRoutes');

// Registro de Rutas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/cliente', clienteRoutes);
app.use('/cliente', carritoRoutes);

// Alias directos para accesos rápidos
app.get('/carrito', (req, res) => res.redirect('/cliente/carrito'));
app.get('/compras', (req, res) => res.redirect('/admin/transacciones'));
app.get('/comprar', (req, res) => res.redirect('/cliente/comprar'));

// Ruta raíz por defecto
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});