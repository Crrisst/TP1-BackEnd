const Usuario = require('./Usuario');

class Administrador extends Usuario {
  #nivelAcceso;

  constructor(id, nombre, email, password, nivelAcceso = 'ADMIN') {
    super(id, nombre, email, password);
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