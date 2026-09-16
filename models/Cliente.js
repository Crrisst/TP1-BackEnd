const Usuario = require('./Usuario'); //[cite: 30]

class Cliente extends Usuario {
  #tipo;
  #porcentajeDescuento;
  #historialEntradas;

  constructor(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, tipo = 'ESTANDAR', porcentajeDescuento = 0) {
    // Pasamos los nuevos campos a la clase padre (Usuario)
    super(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono);
    this.#tipo = tipo; //[cite: 30]
    this.#porcentajeDescuento = porcentajeDescuento; //[cite: 30]
    this.#historialEntradas = []; //[cite: 30]
  }

  getTipo() { return this.#tipo; } //[cite: 30]
  setTipo(tipo) { this.#tipo = tipo; } //[cite: 30]

  getPorcentajeDescuento() { return this.#porcentajeDescuento; } //[cite: 30]
  setPorcentajeDescuento(descuento) { this.#porcentajeDescuento = descuento; } //[cite: 30]

  calcularDescuento(montoBase) {
    return montoBase * this.#porcentajeDescuento; //[cite: 30]
  }

  calcularTotal(montoBase) {
    const descuento = this.calcularDescuento(montoBase); //[cite: 30]
    return montoBase - descuento; //[cite: 30]
  }

  agregarEntrada(entrada) {
    this.#historialEntradas.push(entrada); //[cite: 30]
  }

  getHistorialEntradas() {
    return [...this.#historialEntradas]; //[cite: 30]
  }

  obtenerPerfil() {
    return {
      ...super.obtenerPerfil(), //[cite: 30]
      rol: 'Cliente',
      tipo: this.#tipo,
      porcentajeDescuento: this.#porcentajeDescuento,
      historialEntradas: this.#historialEntradas
    };
  }
}

module.exports = Cliente; //[cite: 30]