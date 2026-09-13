class Entrada {
  #precio;
  #cantidad;

  constructor(id, nombre, descripcion, precio, cantidad) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.#precio = precio;
    this.#cantidad = cantidad;
  }

  getPrecio() {
    return this.#precio;
  }

  setPrecio(nuevoPrecio) {
    if (nuevoPrecio < 0) {
      throw new Error('El precio no puede ser negativo.');
    }
    this.#precio = nuevoPrecio;
  }

  getCantidad() {
    return this.#cantidad;
  }

  actualizarCantidad(nuevaCantidad) {
    if (nuevaCantidad < 0) {
      throw new Error('La cantidad de entradas no puede ser negativa.');
    }
    this.#cantidad = nuevaCantidad;
  }

  calcularSubtotal() {
    return this.#precio * this.#cantidad;
  }

  obtenerDetalle() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.#precio,
      cantidad: this.#cantidad,
      subtotal: this.calcularSubtotal()
    };
  }
}

// Exportación directa de la clase Entrada
module.exports = Entrada;