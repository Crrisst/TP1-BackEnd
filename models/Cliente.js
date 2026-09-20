const Usuario = require('./Usuario'); 

class Cliente extends Usuario {
  #tipo;
  #porcentajeDescuento;
  #historialEntradas;

  constructor(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono, tipo = 'ESTANDAR', porcentajeDescuento = 0) {
    // Pasamos los nuevos campos a la clase padre (Usuario)
    super(id, nombreUsuario, nombre, apellido, email, password, dni, fechaNacimiento, telefono);
    this.#tipo = tipo; 
    this.#porcentajeDescuento = porcentajeDescuento; 
    this.#historialEntradas = [];
  }

  getTipo() { return this.#tipo; } 
  setTipo(tipo) { this.#tipo = tipo; } 

  getPorcentajeDescuento() { return this.#porcentajeDescuento; }
  setPorcentajeDescuento(descuento) { this.#porcentajeDescuento = descuento; } 

  calcularDescuento(montoBase) {
    return montoBase * this.#porcentajeDescuento; 
  }

  calcularTotal(montoBase) {
    const descuento = this.calcularDescuento(montoBase); 
    return montoBase - descuento; 
  }

  agregarEntrada(entrada) {
    this.#historialEntradas.push(entrada); 
  }

  getHistorialEntradas() {
    return [...this.#historialEntradas]; 
  }

  obtenerPerfil() {
    return {
      ...super.obtenerPerfil(), 
      rol: 'Cliente',
      tipo: this.#tipo,
      porcentajeDescuento: this.#porcentajeDescuento,
      historialEntradas: this.#historialEntradas
    };
  }
}

module.exports = Cliente; 