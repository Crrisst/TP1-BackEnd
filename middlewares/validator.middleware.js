/**
 * Middlewares de Validación de Datos
 */

/**
 * Valida que el parámetro ':id' de la URL sea un número entero positivo válido.
 */
const validateId = (req, res, next) => {
  const { id } = req.params;
  const numericId = Number(id);

  if (!id || !Number.isInteger(numericId) || numericId <= 0) {
    return res.status(400).json({
      status: 'error',
      message: 'El parámetro ID debe ser un número entero positivo válido.'
    });
  }

  // Guardamos el ID parseado en req para facilitar su consumo en controladores
  req.parsedId = numericId;
  next();
};

/**
 * Genera un middleware que valida la presencia de campos obligatorios en el body.
 * @param {Array<string>} fields - Lista de nombres de campos requeridos.
 */
const validateRequiredFields = (fields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'El cuerpo de la petición (body) es requerido y debe ser un objeto JSON.'
      });
    }

    const missingFields = fields.filter(
      field => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  validateId,
  validateRequiredFields
};
