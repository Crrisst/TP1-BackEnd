export const errorHandler = (err, req, res, next) => {
    console.error("❌ Error interno:", err.message);
    const status = err.status || 500;
    res.status(status).json({ 
        error: err.message || "Error interno del servidor",
        detalle: err.name === 'ValidationError' ? "Error de validación de datos en Mongoose" : null
    });
};