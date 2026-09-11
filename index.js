const express = require('express');
const app = express();
const port = 3000;

const salasRoutes = require('./routes/salasRoutes');
const entradasRoutes = require('./routes/entradasRoutes');
const eventosRoutes = require('./routes/eventosRoutes');

app.use(express.json());

app.use('/salas', salasRoutes);
app.use('/entradas', entradasRoutes);
app.use('/eventos', eventosRoutes);

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

