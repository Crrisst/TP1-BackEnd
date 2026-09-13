class Sala {
  #capacidad;

  constructor(id, nombre, descripcion, capacidad) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.#capacidad = capacidad;
  }

  getCapacidad() {
    return this.#capacidad;
  }

  setCapacidad(nuevaCapacidad) {
    if (nuevaCapacidad <= 0) {
      throw new Error('La capacidad de la sala debe ser mayor a 0.');
    }
    this.#capacidad = nuevaCapacidad;
  }

  obtenerInformacion() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      capacidad: this.#capacidad
    };
  }
}

module.exports = Sala;