import Entrada from '../models/Entrada.js';
import Transaccion from '../models/Transaccion.js';

const mostrarPanelCliente = async (req, res) => {
  try {
    const usuarioId = req.session.usuario && req.session.usuario.id;
    if (!usuarioId) {
      return res.redirect('/auth/login');
    }

    // Buscamos las entradas activas del cliente con populate anidado
    const entradasActivas = await Entrada.find({ cliente: usuarioId, estado: 'Activa' })
      .populate({
        path: 'evento',
        populate: [
          { path: 'sala' },
          { path: 'entidad' }
        ]
      })
      .sort({ createdAt: -1 });

    // Buscamos el historial de transacciones del cliente
    const historialCompras = await Transaccion.find({ cliente: usuarioId })
      .populate({
        path: 'entradas',
        populate: {
          path: 'evento',
          populate: [
            { path: 'sala' },
            { path: 'entidad' }
          ]
        }
      })
      .sort({ createdAt: -1 });

    res.render('Cliente/compras', {
      usuarioLogueado: req.session.usuario,
      entradas: entradasActivas,
      compras: historialCompras
    });

  } catch (error) {
    console.error('Error al cargar el panel de compras del cliente:', error);
    res.status(500).send('Error interno al cargar el historial.');
  }
};

export { mostrarPanelCliente };