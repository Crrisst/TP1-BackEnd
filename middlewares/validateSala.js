import Sala, { ZONAS, validarZonas } from '../models/Sala.js';

const camposApi = { name: 'nombre', capacity: 'capacidad', type: 'tipo', isAvailable: 'disponible', zones: 'zonas' };
const camposWeb = ['nombre', 'capacidad', 'tipo', 'disponible', 'descripcion', 'ubicacion', 'zonas', 'general', 'platea', 'vip'];
const tipos = ['conferencia', 'reunión', 'laboratorio', 'auditorio'];

const isHtmlRequest = (req) => {
  return (req.headers.accept && req.headers.accept.includes('text/html')) || 
         (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
};

const manejarError = async (req, res, next, message, status = 400) => {
  if (isHtmlRequest(req)) {
    if (req.params && req.params.id) {
      const salaObj = {
        _id: req.params.id,
        nombre: req.body.nombre || '',
        ubicacion: req.body.ubicacion || '',
        capacidad: req.body.capacidad || '',
        descripcion: req.body.descripcion || '',
        zonas: {
          General: req.body.general !== undefined ? req.body.general : 0,
          Platea: req.body.platea !== undefined ? req.body.platea : 0,
          VIP: req.body.vip !== undefined ? req.body.vip : 0
        }
      };
      return res.status(status).render('editarSala', {
        usuarioLogueado: req.session ? req.session.usuario : null,
        sala: salaObj,
        error: message
      });
    } else {
      const salas = await Sala.find();
      return res.status(status).render('salas', {
        usuarioLogueado: req.session ? req.session.usuario : null,
        salas,
        datos: req.body,
        error: message
      });
    }
  }
  return next(Object.assign(new Error(message), { status }));
};

const validarSalaId = (req, res, next) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return manejarError(req, res, next, 'Identificador (ID) con formato no válido.');
  }
  next();
};

const validarSalaBody = (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return manejarError(req, res, next, 'El cuerpo debe ser un objeto.');
  }

  const api = Boolean(req.esApiSalas);
  const permitidos = api ? Object.keys(camposApi) : camposWeb;

  if (Object.keys(body).some(key => !permitidos.includes(key))) {
    return manejarError(req, res, next, 'El formulario contiene campos no permitidos.');
  }

  const datos = {};
  for (const key of Object.keys(body)) {
    datos[api ? camposApi[key] : key] = body[key];
  }

  if (typeof datos.nombre !== 'string' || !datos.nombre.trim()) {
    return manejarError(req, res, next, 'El nombre es obligatorio y debe ser texto válido.');
  }

  if (!api && !datos.zonas) {
    datos.zonas = {
      General: Number(datos.general) || 0,
      Platea: Number(datos.platea) || 0,
      VIP: Number(datos.vip) || 0
    };
  } else if (!api && datos.zonas && typeof datos.zonas === 'object' && !Array.isArray(datos.zonas)) {
    datos.zonas = { ...datos.zonas };
    for (const zona of ZONAS) {
      const valor = datos.zonas[zona];
      if (typeof valor === 'string' && valor.trim()) datos.zonas[zona] = Number(valor);
    }
  }

  try {
    const total = validarZonas(datos.zonas);
    if (datos.capacidad !== undefined) {
      const declarada = !api && typeof datos.capacidad === 'string' && datos.capacidad.trim() ? Number(datos.capacidad) : datos.capacidad;
      if (declarada !== total) {
        return manejarError(req, res, next, 'La capacidad total debe coincidir con la suma de las zonas.');
      }
    }
    datos.capacidad = total;
  } catch (error) {
    return manejarError(req, res, next, error.message);
  }

  if (datos.tipo !== undefined && !tipos.includes(datos.tipo)) {
    return manejarError(req, res, next, `El tipo debe ser uno de: ${tipos.join(', ')}.`);
  }

  if (datos.disponible !== undefined && typeof datos.disponible !== 'boolean') {
    return manejarError(req, res, next, 'La disponibilidad debe ser booleana.');
  }

  for (const key of ['descripcion', 'ubicacion']) {
    if (datos[key] !== undefined && typeof datos[key] !== 'string') {
      return manejarError(req, res, next, `${key} debe ser texto.`);
    }
  }

  datos.nombre = datos.nombre.trim();
  req.salaDatos = datos;
  next();
};

export { validarSalaBody, validarSalaId };