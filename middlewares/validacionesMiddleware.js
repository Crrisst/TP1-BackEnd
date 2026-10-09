// src/middlewares/validacionesMiddleware.js

const validarRegistro = (req, res, next) => {
  const { nombre, apellido, email, telefono, dni, fechaNacimiento } = req.body;
  const regexLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

  if (!nombre || !regexLetras.test(nombre.trim())) {
    return res.status(400).render('auth/registro', { 
      error: 'El nombre solo debe contener letras.',
      datos: req.body 
    });
  }

  if (!apellido || !regexLetras.test(apellido.trim())) {
    return res.status(400).render('auth/registro', { 
      error: 'El apellido solo debe contener letras.',
      datos: req.body 
    });
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !regexEmail.test(email.trim())) {
    return res.status(400).render('auth/registro', { 
      error: 'Por favor, ingresa un correo electrónico válido.',
      datos: req.body 
    });
  }

  const regexTelefono = /^\d{10}$/;
  if (!telefono || !regexTelefono.test(telefono.trim())) {
    return res.status(400).render('auth/registro', { 
      error: 'El teléfono debe contener exactamente 10 números.',
      datos: req.body 
    });
  }

  const regexDni = /^\d{7,8}$/;
  if (!dni || !regexDni.test(dni.trim())) {
    return res.status(400).render('auth/registro', { 
      error: 'El DNI debe contener solo números y tener entre 7 y 8 dígitos.',
      datos: req.body 
    });
  }

  if (!fechaNacimiento) {
    return res.status(400).render('auth/registro', { 
      error: 'La fecha de nacimiento es obligatoria.',
      datos: req.body 
    });
  }

  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  if (edad < 18) {
    return res.status(400).render('auth/registro', { 
      error: 'Debes ser mayor de 18 años para registrarte en el sistema.',
      datos: req.body 
    });
  }

  next();
};

module.exports = { validarRegistro };