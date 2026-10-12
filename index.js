import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
//import crypto from 'node:crypto';

//globalThis.crypto = crypto;

import requestLogger from './middlewares/logger.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.middleware.js';

import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import salasRoutes from './routes/salasRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventosRoutes from './routes/eventosRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';
import entradasRoutes from './routes/entradasRoutes.js';

import { poblarBaseDeDatos } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración del Motor de Plantillas (Pug)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares Centrales
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'mi_secreto_super_seguro_tp2',
  resave: false,
  saveUninitialized: false
}));

// Montaje de Rutas (Subrutas específicas antes de las generales)
app.use('/auth', authRoutes);
app.use('/cliente/carrito', carritoRoutes);
app.use('/cliente', clienteRoutes);
app.use('/salas', salasRoutes);
app.use('/admin', adminRoutes);     
app.use('/eventos', eventosRoutes); 
app.use('/entradas', entradasRoutes); 

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

// Manejadores globales de errores y 404 (Siempre al final)
app.use(notFoundHandler);
app.use(errorHandler);

// Conexión a Base de Datos e Inicialización de Seed
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TP2';

mongoose.connect(uri)
  .then(async () => {
    console.log('📦 Conectado a MongoDB exitosamente');

    try {
      console.log('🌱 Ejecutando seed automático en cada inicio...');
      await poblarBaseDeDatos();
      console.log('✨ Seed automático finalizado con éxito.');
    } catch (seedError) {
      console.error('⚠️ No se pudo ejecutar el seed automático:', seedError);
    }
  })
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Prueba también en tu navegador: http://127.0.0.1:${PORT}`);
});