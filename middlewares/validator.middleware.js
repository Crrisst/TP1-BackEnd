/**
 * Función ayudante inteligente para enviar errores
 */
const sendError = (req, res, message) => {
  // Si la petición acepta HTML (viene del navegador web)
  if (req.accepts('html')) {
    const urlLimpia = req.originalUrl.split('?')[0];
    return res.redirect(`${urlLimpia}?error=${encodeURIComponent(message)}`);
  }
  // Si viene de Postman o Fetch, devolvemos JSON
  return res.status(400).json({ status: 'error', message });
};

const validateId = (req, res, next) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (!id || !Number.isInteger(numericId) || numericId <= 0) {
    return sendError(req, res, 'El parámetro ID debe ser un número entero positivo válido.');
  }

  req.parsedId = numericId;
  next();
};

const validateRequiredFields = (fields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return sendError(req, res, 'El cuerpo de la petición (body) es requerido y debe ser un objeto JSON.');
    }

    const missingFields = fields.filter(
      field => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );

    if (missingFields.length > 0) {
      return sendError(req, res, `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`);
    }

    next();
  };
};

const validateNameFormat = (req, res, next) => {
  const { nombre, apellido } = req.body;
  const regexSoloLetras = /^[a-zA-Z\sÁÉÍÓÚáéíóúÑñ]+$/;

  if (nombre && !regexSoloLetras.test(nombre)) {
    return sendError(req, res, 'El nombre no puede contener números.');
  }
  if (apellido && !regexSoloLetras.test(apellido)) {
    return sendError(req, res, 'El apellido no puede contener números.');
  }
  
  next();
};

const validateDniFormat = (req, res, next) => {
  const { dni } = req.body;
  const regexDni = /^\d{1,8}$/; 

  if (dni && !regexDni.test(dni)) {
    return sendError(req, res, 'El DNI debe contener solo números y tener un máximo de 8 dígitos.');
  }
  next();
};

const validateEmailFormat = (req, res, next) => {
  const { email } = req.body;
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (email && !regexEmail.test(email)) {
    return sendError(req, res, 'Debe ingresar un correo electrónico válido.');
  }
  next();
};

const validateTelefonoFormat = (req, res, next) => {
  const { telefono } = req.body;
  const regexTelefono = /^\d{1,10}$/; 

  if (telefono && !regexTelefono.test(telefono)) {
    return sendError(req, res, 'El teléfono debe contener solo números y tener un máximo de 10 dígitos.');
  }
  next();
};

module.exports = {
  validateId,
  validateRequiredFields,
  validateNameFormat,
  validateDniFormat,
  validateEmailFormat,
  validateTelefonoFormat
};