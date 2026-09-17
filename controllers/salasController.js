const fs = require('fs');
const path = require('path');
const Sala = require('../models/Sala');

const rutaArchivo = path.join(__dirname, '../data/salas.json');

const leerSalas = () => {
  if (!fs.existsSync(rutaArchivo)) return [];
  const data = fs.readFileSync(rutaArchivo, 'utf8');
  if (!data) return [];
  const objetos = JSON.parse(data);
  return objetos.map(s => new Sala(s.id, s.nombre, s.descripcion, s.capacidad));
};

const guardarSalas = (listaSalas) => {
  const datosParaGuardar = listaSalas.map(s => s.obtenerInformacion());
  fs.writeFileSync(rutaArchivo, JSON.stringify(datosParaGuardar, null, 2), 'utf8');
};

const isHtmlRequest = (req) => {
  return (req.headers.accept && req.headers.accept.includes('text/html')) ||
         (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
};

const getSalas = (req, res) => {
  const salas = leerSalas().map(s => s.obtenerInformacion());
  if (isHtmlRequest(req)) {
    return res.render('salas', { salas });
  }
  res.json(salas);
};

const getSalaById = (req, res) => {
  const salas = leerSalas();
  const sala = salas.find(s => s.id === parseInt(req.params.id));
  
  if (sala) {
    res.json(sala.obtenerInformacion());
  } else {
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

const createSala = (req, res) => {
  const salas = leerSalas();
  const { nombre, descripcion, capacidad } = req.body;
  const capNum = parseInt(capacidad);
  
  //Validacion campos obligatorios
  if(!nombre || !descripcion || capacidad === undefined){
    if (isHtmlRequest(req)) {
      return res.redirect('/salas');
    }
    return res.status(400).json({
      message: 'Todos los campos son obligatorios.'
    });
  }
  //Valida la capacidad
  if(isNaN(capNum) || capNum <= 0){
    if (isHtmlRequest(req)) {
      return res.redirect('/salas');
    }
    return res.status(400).json({
      message: 'La capacidad debe ser mayor a 0.'
    });
  }
  const nuevaSala = new Sala(Date.now(), nombre, descripcion, capNum);
  salas.push(nuevaSala);
  guardarSalas(salas);
  
  if (isHtmlRequest(req)) {
    return res.redirect('/salas');
  }
  res.status(201).json(nuevaSala.obtenerInformacion());
};

const updateSala = (req, res) => {
  const salas = leerSalas();
  const sala = salas.find(s => s.id === parseInt(req.params.id));
  
  if (sala) {
    const { nombre, descripcion, capacidad } = req.body;
        
    //validar capacidad antes de modificar la sala.
    if (capacidad !== undefined && parseInt(capacidad) <= 0) {      
      if (isHtmlRequest(req)) {
        return res.redirect('/salas');
      }
      return res.status(400).json({
        message: 'La capacidad debe ser mayor a 0.'        
      });      
    }

    if (nombre) sala.nombre = nombre;
    if (descripcion) sala.descripcion = descripcion;
    if (capacidad !== undefined) sala.setCapacidad(parseInt(capacidad));
    
    guardarSalas(salas);
    if (isHtmlRequest(req)) {
      return res.redirect('/salas');
    }
    res.json(sala.obtenerInformacion());
  } else {
    if (isHtmlRequest(req)) {
      return res.redirect('/salas');
    }
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

const deleteSala = (req, res) => {
  const salas = leerSalas();
  const salaIndex = salas.findIndex(s => s.id === parseInt(req.params.id));
  
  if (salaIndex !== -1) {
    const [salaEliminada] = salas.splice(salaIndex, 1);
    guardarSalas(salas);
    if (isHtmlRequest(req)) {
      return res.redirect('/salas');
    }
    res.json({ message: 'Sala eliminada', sala: salaEliminada.obtenerInformacion() });
  } else {
    if (isHtmlRequest(req)) {
      return res.redirect('/salas');
    }
    res.status(404).json({ message: 'Sala no encontrada' });
  }
};

// NUEVA: Formulario de edición
const showEditSalaForm = (req, res) => {
  const salas = leerSalas();
  const sala = salas.find(s => s.id === parseInt(req.params.id));

  if (!sala) {
    return res.redirect('/salas?error=Sala+no+encontrada');
  }

  res.render('editarSala', {
    sala: sala.obtenerInformacion(),
    error: req.query.error
  });
};

module.exports = {
  getSalas,
  getSalaById,
  createSala,
  updateSala,
  deleteSala,
  showEditSalaForm
};
