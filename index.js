const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

const { requestLogger, notFoundHandler, errorHandler } = require('./middlewares');

const salasRoutes = require('./routes/salasRoutes');
const entradasRoutes = require('./routes/entradasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

// Configuración del motor de vistas Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares globales de procesamiento y auditoría
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Ruta raíz
app.get('/', (req, res) => {
  res.redirect('/eventos');
});

// Registro de Rutas
app.use('/salas', salasRoutes);
app.use('/entradas', entradasRoutes);
app.use('/eventos', eventosRoutes);
app.use('/usuarios', usuariosRoutes);

// Middlewares de manejo de errores y rutas no encontradas
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
