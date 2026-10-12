//const { ZONAS, validarZonas } = require('../models/Sala');
import { ZONAS, validarZonas } from '../models/Sala.js';
const camposApi = { name: 'nombre', capacity: 'capacidad', type: 'tipo', isAvailable: 'disponible', zones: 'zonas' };
const camposWeb = ['nombre', 'capacidad', 'tipo', 'disponible', 'descripcion', 'ubicacion', 'zonas'];
const tipos = ['conferencia', 'reunión', 'laboratorio', 'auditorio'];
const fallo = (next, message) => next(Object.assign(new Error(message), { status: 400 }));

const validarSalaId = (req, res, next) => {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) return fallo(next, 'Identificador (ID) con formato no válido.');
  next();
};

const validarSalaBody = (req, res, next) => {
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fallo(next, 'El cuerpo debe ser un objeto.');
  const api = Boolean(req.esApiSalas);
  const permitidos = api ? Object.keys(camposApi) : camposWeb;
  if (Object.keys(body).some(key => !permitidos.includes(key))) return fallo(next, 'El cuerpo contiene campos no permitidos.');
  const datos = {};
  for (const key of Object.keys(body)) datos[api ? camposApi[key] : key] = body[key];
  if (typeof datos.nombre !== 'string' || !datos.nombre.trim()) return fallo(next, 'El nombre es obligatorio y debe ser texto válido.');
  if (!api && datos.zonas && typeof datos.zonas === 'object' && !Array.isArray(datos.zonas)) {
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
      if (declarada !== total) return fallo(next, 'La capacidad total debe coincidir con la suma de las zonas.');
    }
    datos.capacidad = total;
  } catch (error) { return next(error); }
  if (datos.tipo !== undefined && !tipos.includes(datos.tipo)) return fallo(next, `El tipo debe ser uno de: ${tipos.join(', ')}.`);
  if (datos.disponible !== undefined && typeof datos.disponible !== 'boolean') return fallo(next, 'La disponibilidad debe ser booleana.');
  for (const key of ['descripcion', 'ubicacion']) {
    if (datos[key] !== undefined && typeof datos[key] !== 'string') return fallo(next, `${key} debe ser texto.`);
  }
  datos.nombre = datos.nombre.trim();
  req.salaDatos = datos;
  next();
};
//module.exports = { validarSalaBody, validarSalaId };

export { validarSalaBody, validarSalaId };