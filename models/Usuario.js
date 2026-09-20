class Usuario {
  #id;
  #nombreUsuario;
  #nombre;
  #apellido;
  #email;
  #password;
  #dni;
  #fechaNacimiento;
  #telefono;

  constructor(id, nombreUsuario, nombre, apellido, email, password, dni = null, fechaNacimiento = null, telefono = null) {
    this.#id = id;
    this.#nombreUsuario = nombreUsuario;
    this.#nombre = nombre;
    this.#apellido = apellido;
    this.#email = email;
    this.#password = password;
    this.#dni = dni;
    this.#fechaNacimiento = fechaNacimiento;
    this.#telefono = telefono;
  }

  getId() { return this.#id; }
  getNombreUsuario() { return this.#nombreUsuario; }
  getNombre() { return this.#nombre; }
  getApellido() { return this.#apellido; }
  getEmail() { return this.#email; }
  getDni() { return this.#dni; }
  getFechaNacimiento() { return this.#fechaNacimiento; }
  getTelefono() { return this.#telefono; }

  setNombreUsuario(nombreUsuario) { this.#nombreUsuario = nombreUsuario; }
  setNombre(nombre) { this.#nombre = nombre; }
  setApellido(apellido) { this.#apellido = apellido; }
  setEmail(email) { this.#email = email; }
  setPassword(password) { this.#password = password; }
  setDni(dni) { this.#dni = dni; }
  setFechaNacimiento(fechaNacimiento) { this.#fechaNacimiento = fechaNacimiento; }
  setTelefono(telefono) { this.#telefono = telefono; }

  validarPassword(passwordIngresada) {
    return this.#password === passwordIngresada; 
  }

  obtenerPerfil() {
    return {
      id: this.#id,
      nombreUsuario: this.#nombreUsuario,
      nombre: this.#nombre,
      apellido: this.#apellido,
      email: this.#email,
      dni: this.#dni,
      fechaNacimiento: this.#fechaNacimiento,
      telefono: this.#telefono
    };
  }
}

module.exports = Usuario;