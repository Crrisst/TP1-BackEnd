import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'node:crypto';
globalThis.crypto = crypto;

import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import salasRoutes from './routes/salasRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventosRoutes from './routes/eventosRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';
import entradasRoutes from './routes/entradasRoutes.js';

import { poblarBaseDeDatos } from './seed.js';
import Entidad from './models/Entidad.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'mi_secreto_super_seguro_tp2',
  resave: false,
  saveUninitialized: false
}));

app.use('/auth', authRoutes);
app.use('/cliente', clienteRoutes);
app.use('/salas', salasRoutes);
app.use('/admin', adminRoutes);     
app.use('/eventos', eventosRoutes); 
app.use('/cliente/carrito', carritoRoutes); // 👈 Carrito unificado bajo /cliente/carrito
app.use('/entradas', entradasRoutes); 

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.use((req, res) => {
  res.status(404).send('Página no encontrada');
});

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TP2';

mongoose.connect(uri)
  .then(async () => {
    console.log('📦 Conectado a MongoDB exitosamente');

    try {
      const cantidadEntidades = await Entidad.countDocuments();
      if (cantidadEntidades === 0) {
        console.log('⚠️ La base de datos está vacía. Ejecutando seed automático...');
        await poblarBaseDeDatos();
        console.log('✨ Seed automático finalizado con éxito.');
      }
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