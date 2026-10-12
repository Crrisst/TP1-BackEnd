import Entrada from '../models/Entrada.js';
import Transaccion from '../models/Transaccion.js';

const mostrarPanelCliente = async (req, res) => {
  try {
    const usuarioId = req.session.usuario && (req.session.usuario.id || req.session.usuario._id);
    if (!usuarioId) {
      return res.redirect('/auth/login');
    }

    // Busca entradas activas o completadas vinculadas al cliente
    const entradasActivas = await Entrada.find({ 
      cliente: usuarioId, 
      estado: { $in: ['Activa', 'Completado'] } 
    })
      .populate({
        path: 'evento',
        populate: [
          { path: 'sala' },
          { path: 'entidad' }
        ]
      })
      .sort({ createdAt: -1 });

    // Carga el historial de compras directo del modelo Transaccion
    const historialCompras = await Transaccion.find({ cliente: usuarioId })
      .sort({ fechaCompra: -1 });

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