// src/controllers/adminController.js
const Usuario = require('../models/Usuario');

const mostrarFormularioCrearPersonal = (req, res) => {
  try {
    res.render('Admin/crear-personal', {
      usuarioLogueado: req.session.usuario
    });
  } catch (error) {
    console.error('Error al cargar la vista:', error);
    res.status(500).send('Error interno del servidor');
  }
};

const registrarPersonalInterno = async (req, res) => {
  try {
    const { 
      nombreUsuario, 
      nombre, 
      apellido, 
      email, 
      password, 
      dni, 
      fechaNacimiento, 
      telefono, 
      rol 
    } = req.body;

    if (rol === 'Cliente') {
      return res.status(400).render('Admin/crear-personal', {
        error: 'Los clientes deben registrarse por la vía pública.',
        usuarioLogueado: req.session.usuario
      });
    }

    const nuevoPersonal = new Usuario({
      nombreUsuario,
      nombre,
      apellido,
      email,
      password,
      dni,
      fechaNacimiento,
      telefono,
      rol
    });

    await nuevoPersonal.save();
    res.redirect('/admin/dashboard?exito=Personal creado correctamente');
  } catch (error) {
    console.error('Error al crear personal interno:', error);
    res.status(400).render('Admin/crear-personal', {
      error: 'No se pudo registrar el personal. Verifique los datos o si el email ya existe.',
      usuarioLogueado: req.session.usuario
    });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: -1 });
    res.render('Admin/usuarios', {
      usuarioLogueado: req.session.usuario,
      usuarios,
      exito: req.query.exito || null
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).send('Error interno al obtener los usuarios');
  }
};

const mostrarFormularioEditarUsuario = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }
    res.render('Admin/editarUsuario', {
      usuarioLogueado: req.session.usuario,
      usuario
    });
  } catch (error) {
    console.error('Error al cargar edición:', error);
    res.status(500).send('Error al cargar el usuario');
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { nombreUsuario, nombre, apellido, email, dni, telefono, rol, tipoCliente } = req.body;
    await Usuario.findByIdAndUpdate(req.params.id, {
      nombreUsuario, nombre, apellido, email, dni, telefono, rol, tipoCliente
    });
    res.redirect('/admin/usuarios?exito=Usuario actualizado exitosamente');
  } catch (error) {
    console.error('Error al actualizar:', error);
    res.status(400).send('Error al actualizar el usuario');
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.redirect('/admin/usuarios?exito=Usuario eliminado correctamente');
  } catch (error) {
    console.error('Error al eliminar:', error);
    res.status(500).send('Error al eliminar el usuario');
  }
};

module.exports = {
  mostrarFormularioCrearPersonal,
  registrarPersonalInterno,
  listarUsuarios,
  mostrarFormularioEditarUsuario,
  actualizarUsuario,
  eliminarUsuario
};