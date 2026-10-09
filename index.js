// index.js
global.crypto = require('crypto'); // <-- Añade esta línea al inicio de todo

const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Conexión a MongoDB (Base de datos TP2)
mongoose.connect('mongodb://localhost:27017/TP2')
.then(() => console.log('Conectado a MongoDB (TP2)'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

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

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/cliente', clienteRoutes);

// Ruta raíz por defecto
app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});