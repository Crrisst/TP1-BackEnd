export const validarPago = (req, res, next) => {
    try {
        const { titular, tarjeta, vencimiento, cvv } = req.body;

        // Verificar campos obligatorios
        if (!titular || !tarjeta || !vencimiento || !cvv) {
            return res.status(400).json({ error: "⚠️ Todos los campos de pago son obligatorios." });
        }

        // Validar titular: solo letras y espacios (máximo 30 caracteres)
        const soloLetrasRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,30}$/;
        if (!soloLetrasRegex.test(titular.trim())) {
            return res.status(400).json({ error: "⚠️ El nombre del titular debe contener únicamente letras y un máximo de 30 caracteres." });
        }

        // Validar tarjeta: exactamente 16 dígitos numéricos
        const tarjetaRegex = /^\d{16}$/;
        if (!tarjetaRegex.test(tarjeta.trim())) {
            return res.status(400).json({ error: "⚠️ El número de tarjeta debe contener exactamente 16 dígitos numéricos." });
        }

        // Validar CVV: 3 o 4 dígitos numéricos
        const cvvRegex = /^\d{3,4}$/;
        if (!cvvRegex.test(cvv.trim())) {
            return res.status(400).json({ error: "⚠️ El código de seguridad (CVV) debe tener 3 o 4 dígitos." });
        }

        // Validar formato de vencimiento MM/AA
        const vencimientoRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!vencimientoRegex.test(vencimiento.trim())) {
            return res.status(400).json({ error: "⚠️ La fecha de vencimiento debe tener el formato válido MM/AA." });
        }

        next(); // Todo correcto, procede a registrar la entrada / pago
    } catch (error) {
        console.error("Error en validación de pago:", error);
        return res.status(400).json({ error: "⚠️ Error al procesar los datos de pago." });
    }
};