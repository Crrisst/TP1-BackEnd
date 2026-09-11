const fs = require('fs');
const path = require('path');

const Entradas = require('../models/entradas').Entradas;

const rutaArchivo = path.join(__dirname, '../data/entradas.json');

// Función para leer las entradas desde el archivo JSON

const leerEntradas = () => {
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  return JSON.parse(data);
};

// funcion para guardar las entradas en el archivo JSON
const guardarEntradas = (entradas) => {
  fs.writeFileSync(rutaArchivo, JSON.stringify(entradas, null, 2), 'utf8');
}


//get all entradas
const getEntradas = (req, res) => {
    const entradas = leerEntradas();
    res.json(entradas);
};

//get entrada by id
const getEntradaById = (req, res) => {
    const entradas = leerEntradas();
    const entrada = entradas.find(e => e.id === parseInt(req.params.id));
    if (entrada) {
        res.json(entrada);
    } else {
        res.status(404).json({ message: 'Entrada no encontrada' });
    }
};

//create entrada
const createEntrada = (req, res) => {
    const entradas = leerEntradas();
    const { nombre, descripcion, precio, cantidad } = req.body;
    const nuevaEntrada = new Entradas(Date.now(), nombre, descripcion, precio, cantidad);
    entradas.push(nuevaEntrada);
    guardarEntradas(entradas);
    res.status(201).json(nuevaEntrada);
};

//update entrada
const updateEntrada = (req, res) => {
    const entradas = leerEntradas();
    const entrada = entradas.find(e => e.id === parseInt(req.params.id));
    if (entrada) {
        const { nombre, descripcion, precio, cantidad } = req.body;
        entrada.nombre = nombre || entrada.nombre;
        entrada.descripcion = descripcion || entrada.descripcion;
        entrada.precio = precio || entrada.precio;
        entrada.cantidad = cantidad || entrada.cantidad;
        guardarEntradas(entradas);
        res.json(entrada);
    } else {
        res.status(404).json({ message: 'Entrada no encontrada' });
    } 
};

//delete entrada

const deleteEntrada = (req, res) => {
    const entradas = leerEntradas();
    const index = entradas.findIndex(e => e.id === parseInt(req.params.id));
    if (index !== -1) {
        const entradaEliminada = entradas.splice(index, 1);
        guardarEntradas(entradas);
        res.json(entradaEliminada[0]);
    } else {
        res.status(404).json({ message: 'Entrada no encontrada' });
    } 

};

module.exports = {
    getEntradas,
    getEntradaById,
    createEntrada,
    updateEntrada,
    deleteEntrada
};