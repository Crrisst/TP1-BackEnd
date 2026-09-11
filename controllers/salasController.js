const fs  = require('fs');
const path = require('path');

const salas = require('../models/salas').salas;

const rutaArchivo = path.join(__dirname, '../data/salas.json');

// Función para leer las salas desde el archivo JSON
const leerSalas = () => {
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  return JSON.parse(data);
};

// funcion para guardar las salas en el archivo JSON
const guardarSalas = (salas) => {
  fs.writeFileSync(rutaArchivo, JSON.stringify(salas, null, 2), 'utf8');
}

//get all salas
const getSalas = (req, res) => {
    const salas = leerSalas();
    res.json(salas);
};

//get sala by id
const getSalaById = (req, res) => {
    const salas = leerSalas();
    const sala = salas.find(s => s.id === parseInt(req.params.id));
    if (sala) {
        res.json(sala);
    } else {
        res.status(404).json({ message: 'Sala no encontrada' });
    }
};

//create sala
const createSala = (req, res) => {
    const salas = leerSalas();
    const { nombre, descripcion, capacidad } = req.body;
    const nuevaSala = new salas(Date.now(), nombre, descripcion, capacidad);
    salas.push(nuevaSala);
    guardarSalas(salas);
    res.status(201).json(nuevaSala);
}

//update sala
const updateSala = (req, res) => {
    const salas = leerSalas();
    const sala = salas.find(s => s.id === parseInt(req.params.id));
    if (sala) {
        const { nombre, descripcion, capacidad } = req.body;
        sala.nombre = nombre || sala.nombre;
        sala.descripcion = descripcion || sala.descripcion;
        sala.capacidad = capacidad || sala.capacidad;
        guardarSalas(salas);
        res.json(sala);
    } else {
        res.status(404).json({ message: 'Sala no encontrada' });
    }
};

//delete sala
const deleteSala = (req, res) => {
    const salas = leerSalas();
    const salaIndex = salas.findIndex(s => s.id === parseInt(req.params.id));
    if (salaIndex !== -1) {
        const salaEliminada = salas.splice(salaIndex, 1);
        guardarSalas(salas);
        res.json({ message: 'Sala eliminada', sala: salaEliminada[0] });
    } else {
        res.status(404).json({ message: 'Sala no encontrada' });
    }   
};

module.exports = {
    getSalas,
    getSalaById,
    createSala,
    updateSala,
    deleteSala
};
