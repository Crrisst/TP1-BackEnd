class Usuario {
  #id;
  #nombre;
  #email;
  #password;

  constructor(id, nombre, email, password) {
    this.#id = id;
    this.#nombre = nombre;
    this.#email = email;
    this.#password = password;
  }

  getId() { return this.#id; }
  getNombre() { return this.#nombre; }
  getEmail() { return this.#email; }

  setNombre(nombre) { this.#nombre = nombre; }
  setEmail(email) { this.#email = email; }
  setPassword(password) { this.#password = password; }

  validarPassword(passwordIngresada) {
    return this.#password === passwordIngresada;
  }

  obtenerPerfil() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      email: this.#email
    };
  }
}

module.exports = Usuario;