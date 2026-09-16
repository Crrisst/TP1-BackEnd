const Usuario = require('./Usuario'); //[cite: 31]

class Administrador extends Usuario {
  #nivelAcceso;

  constructor(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, nivelAcceso = 'ADMIN') {
    // Pasamos los nuevos campos a la clase padre (Usuario)
    super(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono);
    this.#nivelAcceso = nivelAcceso; //[cite: 31]
  }

  puedeGestionarSalas() {
    return true; //[cite: 31]
  }

  getNivelAcceso() {
    return this.#nivelAcceso; //[cite: 31]
  }

  setNivelAcceso(nivel) {
    this.#nivelAcceso = nivel; //[cite: 31]
  }

  obtenerPerfil() {
    return {
      ...super.obtenerPerfil(), //[cite: 31]
      rol: 'Administrador',
      nivelAcceso: this.#nivelAcceso
    };
  }
}

module.exports = Administrador; //[cite: 31]