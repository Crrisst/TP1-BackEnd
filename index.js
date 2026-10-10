global.crypto = require('crypto');

const express = require('express');
const { conectarBaseDeDatos } = require('./seed');
const session = require('express-session');
const path = require('path');

const { requestLogger, notFoundHandler, errorHandler } = require('./middlewares');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const salasRoutes = require('./routes/salasRoutes');
const entradasRoutes = require('./routes/entradasRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

app.use(session({
  secret: 'secreto_tp_backend_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/cliente', clienteRoutes);
app.use('/cliente', carritoRoutes);
app.use('/eventos', eventosRoutes);
app.use('/salas', salasRoutes);
app.use('/api/rooms', salasRoutes.apiRouter);
app.use('/api/entradas', entradasRoutes);

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

app.use(notFoundHandler);
app.use(errorHandler);

async function iniciarServidor() {
  await conectarBaseDeDatos();
  return app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = { app, iniciarServidor };

if (require.main === module) {
  iniciarServidor().catch(error => {
    console.error('Error al iniciar el servidor:', error.message);
    process.exitCode = 1;
  });
}
