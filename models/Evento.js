class Evento {
  #entradasDisponibles;

  constructor(id, nombre, descripcion, fecha, hora, entradasDisponibles = 0) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fecha = fecha;
    this.hora = hora;
    this.#entradasDisponibles = entradasDisponibles;
  }

  getEntradasDisponibles() {
    return this.#entradasDisponibles;
  }

  // Permite vender tickets controlando el stock disponible
  venderEntradas(cantidad) {
    if (cantidad <= 0) {
      throw new Error('La cantidad a vender debe ser mayor a cero.');
    }
    if (cantidad > this.#entradasDisponibles) {
      throw new Error('No hay suficientes entradas disponibles para este evento.');
    }
    this.#entradasDisponibles -= cantidad;
    return true;
  }

  obtenerFichaPublica() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      fecha: this.fecha,
      hora: this.hora,
      agotado: this.#entradasDisponibles === 0
    };
  }
}

module.exports = Evento;