const Usuario = require('./Usuario'); 

class Administrador extends Usuario {
  #nivelAcceso;

  constructor(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, nivelAcceso = 'ADMIN') {
    // Pasamos los nuevos campos a la clase padre (Usuario)
    super(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono);
    this.#nivelAcceso = nivelAcceso; 
  }

  puedeGestionarSalas() {
    return true; 
  }

  getNivelAcceso() {
    return this.#nivelAcceso; 
  }

  setNivelAcceso(nivel) {
    this.#nivelAcceso = nivel; 
  }

  obtenerPerfil() {
    return {
      ...super.obtenerPerfil(), 
      rol: 'Administrador',
      nivelAcceso: this.#nivelAcceso
    };
  }
}

module.exports = Administrador; 