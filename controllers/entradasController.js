import Entrada from '../models/Entrada.js';
import Transaccion from '../models/Transaccion.js';
import Evento from '../models/Evento.js';

const getEntradas = async (req, res) => {
  try {
    // Verificación robusta del usuario logueado usando id o _id
    const usuarioLogueado = req.session && req.session.usuario;
    const usuarioId = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado._id) : null;

    const filtro = usuarioLogueado && usuarioLogueado.rol === 'Cliente' && usuarioId
      ? { cliente: usuarioId } 
      : {};

    const entradas = await Entrada.find(filtro).populate('evento cliente');
    res.json(entradas);
  } catch (error) {
    console.error('Error al obtener entradas:', error);
    res.status(500).json({ message: 'Error al obtener entradas' });
  }
};

const getEntradaById = async (req, res) => {
  try {
    const entrada = await Entrada.findById(req.params.id).populate('evento cliente');
    if (!entrada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json(entrada);
  } catch (error) {
    console.error('Error al buscar entrada por ID:', error);
    res.status(500).json({ message: 'Error al buscar entrada' });
  }
};

const createEntrada = async (req, res) => {
  try {
    const usuarioLogueado = req.session && req.session.usuario;
    const usuarioId = usuarioLogueado ? (usuarioLogueado.id || usuarioLogueado._id) : req.body.cliente;

    const { evento, cantidad, total } = req.body;
    const nuevaEntrada = new Entrada({
      cliente: usuarioId,
      evento,
      cantidad: parseInt(cantidad) || 1,
      total: parseFloat(total) || 0
    });

    await nuevaEntrada.save();
    res.status(201).json(nuevaEntrada);
  } catch (error) {
    console.error('Error al registrar la compra de entrada:', error);
    res.status(500).json({ message: 'Error al registrar la compra' });
  }
};

const updateEntrada = async (req, res) => {
  try {
    const entradaActualizada = await Entrada.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entradaActualizada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json(entradaActualizada);
  } catch (error) {
    console.error('Error al actualizar entrada:', error);
    res.status(500).json({ message: 'Error al actualizar entrada' });
  }
};

const deleteEntrada = async (req, res) => {
  try {
    const entradaEliminada = await Entrada.findByIdAndDelete(req.params.id);
    if (!entradaEliminada) return res.status(404).json({ message: 'Entrada no encontrada' });
    res.json({ message: 'Entrada eliminada', entrada: entradaEliminada });
  } catch (error) {
    console.error('Error al eliminar entrada:', error);
    res.status(500).json({ message: 'Error al eliminar entrada' });
  }
};


const mostrarGestionEntradas = async (req, res) => {
  try {
    const [eventosBD, transacciones] = await Promise.all([
      Evento.find().populate('sala').lean(),
      Transaccion.find().lean()
    ]);

    // 1. Acumulador de ventas y recaudación por evento
    const acumuladorPorEvento = {};

    transacciones.forEach(transaccion => {
      if (Array.isArray(transaccion.items) && transaccion.items.length > 0) {
        
        // Suma nominal de ítems de esta transacción
        const subtotalItems = transaccion.items.reduce((acc, it) => {
          return acc + ((Number(it.cantidad) || 0) * (Number(it.precio) || 0));
        }, 0);

        // Si el total registrado difiere (descuento / costo servicio), se prorratea
        const totalTransaccion = Number(transaccion.total) || subtotalItems;

        transaccion.items.forEach(item => {
          const evId = String(item.eventoId);
          const cantidad = Number(item.cantidad) || 0;
          const nominalItem = cantidad * (Number(item.precio) || 0);

          let montoReal = nominalItem;
          if (subtotalItems > 0) {
            montoReal = (nominalItem / subtotalItems) * totalTransaccion;
          }

          if (!acumuladorPorEvento[evId]) {
            acumuladorPorEvento[evId] = { vendidas: 0, recaudado: 0 };
          }

          acumuladorPorEvento[evId].vendidas += cantidad;
          acumuladorPorEvento[evId].recaudado += montoReal;
        });
      }
    });

    // 2. Mapeo de eventos con columnas claras: Cupo, Vendidas, Disponibles
    const eventos = eventosBD.map(ev => {
      const idStr = String(ev._id);
      const datosVenta = acumuladorPorEvento[idStr] || { vendidas: 0, recaudado: 0 };

      const vendidas = datosVenta.vendidas;
      const recaudado = Math.round(datosVenta.recaudado);

      // Detectamos el campo correcto de cupo (entradasDisponibles o entradas)
      const cupo = Number(ev.entradasDisponibles ?? ev.entradas ?? 0);
      const disponibles = Math.max(0, cupo - vendidas);

      const porcentaje = cupo > 0 
        ? Math.min(100, Math.round((vendidas / cupo) * 100)) 
        : 0;

      return {
        id: ev._id,
        nombre: ev.nombre,
        sala: ev.sala ? ev.sala.nombre : 'Sin sala',
        cupo,
        vendidas,
        disponibles,
        recaudado,
        porcentaje
      };
    });

    // 3. Totales consolidados (suman EXACTAMENTE lo que muestran las filas)
    const totalTicketsVendidos = eventos.reduce((acc, curr) => acc + curr.vendidas, 0);
    const totalRecaudadoReal = eventos.reduce((acc, curr) => acc + curr.recaudado, 0);

    res.render('Admin/entradas', {
      usuarioLogueado: req.session.usuario,
      resumen: {
        totalTransacciones: transacciones.length,
        totalVendidas: totalTicketsVendidos,
        totalRecaudado: totalRecaudadoReal
      },
      eventos
    });
  } catch (error) {
    res.status(500).render('Admin/dashboard', { 
      error: 'Error al consultar transacciones: ' + error.message 
    });
  }
};

export {
  getEntradas,
  getEntradaById,
  createEntrada,
  updateEntrada,
  deleteEntrada,
  mostrarGestionEntradas
};