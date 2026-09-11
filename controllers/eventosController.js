const fs = require('fs');
const path = require('path');


const eventos = require('../models/eventos').eventos;

const rutaArchivo = path.join(__dirname, '../data/eventos.json');


// Función para leer los eventos desde el archivo JSON
const leerEventos = () => {
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  return JSON.parse(data);
};

// funcion para guardar los eventos en el archivo JSON
const guardarEventos = (eventos) => {
  fs.writeFileSync(rutaArchivo, JSON.stringify(eventos, null, 2), 'utf8');
}

//get all eventos
const getEventos = (req, res) => {
    const eventos = leerEventos();
    res.json(eventos);
};

//get evento by id
const getEventoById = (req, res) => {
    const eventos = leerEventos();
    const evento = eventos.find(e => e.id === parseInt(req.params.id));
    if (evento) {
        res.json(evento);
    } else {
        res.status(404).json({ message: 'Evento no encontrado' });
    }
};

//create evento
const createEvento = (req, res) => {
    const eventos = leerEventos();
    const { nombre, descripcion, fecha, hora } = req.body;
    const nuevoEvento = new eventos(Date.now(), nombre, descripcion, fecha, hora);
    eventos.push(nuevoEvento);
    guardarEventos(eventos);
    res.status(201).json(nuevoEvento);
};

//update evento
const updateEvento = (req, res) => {
    const eventos = leerEventos();

    const evento = eventos.find(e => e.id === parseInt(req.params.id));
    if (evento) {
        const { nombre, descripcion, fecha, hora } = req.body;
        evento.nombre = nombre || evento.nombre;
        evento.descripcion = descripcion || evento.descripcion;
        evento.fecha = fecha || evento.fecha;
        evento.hora = hora || evento.hora;
        guardarEventos(eventos);
        res.json(evento);
    } else {
        res.status(404).json({ message: 'Evento no encontrado' });
    }
};

//delete evento
const deleteEvento = (req, res) => {
    const eventos = leerEventos();
    const index = eventos.findIndex(e => e.id === parseInt(req.params.id));
    if (index !== -1) {
        eventos.splice(index, 1);
        guardarEventos(eventos);
        res.json({ message: 'Evento eliminado' });
    }
    else {
        res.status(404).json({ message: 'Evento no encontrado' });
    }
};

module.exports = {
    getEventos,
    getEventoById,
    createEvento,
    updateEvento,
    deleteEvento
};