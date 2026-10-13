import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import crypto from 'crypto';
if (!global.crypto) {
  global.crypto = crypto;
}

// Conexión modularizada
import { conectarDB } from './config/db.js';

// Middlewares
import requestLogger from './middlewares/logger.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.middleware.js';

// Rutas
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import salasRoutes from './routes/salasRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventosRoutes from './routes/eventosRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';
import entradasRoutes from './routes/entradasRoutes.js';

// Seed desde la carpeta scripts
import { poblarBaseDeDatos } from './scripts/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'mi_secreto_super_seguro_tp2',
  resave: false,
  saveUninitialized: false
}));

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

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

conectarDB()
  .then(async () => {
    try {
      console.log('🌱 Ejecutando seed automático en cada inicio...');
      await poblarBaseDeDatos();
      console.log('✨ Seed automático finalizado con éxito.');
    } catch (seedError) {
      console.error('⚠️ No se pudo ejecutar el seed automático:', seedError);
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🌐 Prueba también en tu navegador: http://127.0.0.1:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error crítico al iniciar la aplicación:', err);
  });