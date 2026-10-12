import crypto from 'node:crypto';
globalThis.crypto = crypto;

import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'url';

import Usuario from './models/Usuario.js';
import Sala from './models/Sala.js';
import Evento from './models/Evento.js';
import Entrada from './models/Entrada.js';
import Transaccion from './models/Transaccion.js';
import Entidad from './models/Entidad.js'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function conectarBaseDeDatos() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TP2');
  }
  await Sala.init();
}

async function poblarBaseDeDatos() {
  const esEjecucionDirecta = process.argv[1] && path.resolve(process.argv[1]) === __filename;
  
  try {
    await conectarBaseDeDatos();
    console.log('📦 Conectado a MongoDB para seed...');

    await Usuario.deleteMany({});
    await Sala.deleteMany({});
    await Evento.deleteMany({});
    await Entrada.deleteMany({});
    await Transaccion.deleteMany({});
    await Entidad.deleteMany({}); 

    console.log('🧹 Base de datos limpiada.');

    const entidadesSeed = [
      { nombre: 'Fuerza Bruta' },
      { nombre: 'Cirque du Soleil' },
      { nombre: 'Orquesta Sinfónica Nacional' },
      { nombre: 'Les Luthiers' },
      { nombre: 'Fundación Konex' },
      { nombre: 'Charly García' },
      { nombre: 'Gustavo Cerati' },
      { nombre: 'Bizarrap' },
      { nombre: 'Tini Stoessel' },
      { nombre: 'Wos' }
    ];

    const entidadesGuardadas = await Entidad.insertMany(entidadesSeed);
    console.log(`🎭 ${entidadesGuardadas.length} entidades culturales cargadas con éxito.`);

    await Usuario.create({
      nombreUsuario: 'admin', nombre: 'Administrador', apellido: 'Principal', email: 'admin@email.com', password: '123', dni: '99887766', fechaNacimiento: new Date('1980-01-01'), telefono: '1100112233', rol: 'Administrador', tipoCliente: 'VIP', porcentajeDescuento: 0.3
    });

    const cliente1 = await Usuario.create({
      nombreUsuario: 'cliente1', nombre: 'Juan', apellido: 'Perez', email: 'juan.perez@email.com', password: '123', dni: '12345678', fechaNacimiento: new Date('1995-05-15'), telefono: '1122334455', rol: 'Cliente', tipoCliente: 'VIP', porcentajeDescuento: 0.3
    });

    const salaTeatro = await Sala.create({
      nombre: 'Teatro Gran Rex', descripcion: 'Sala clásica céntrica', capacidad: 500, zonas: { General: 300, Platea: 150, VIP: 50 }, ubicacion: 'Centro Histórico'
    });

    const eventoCultural = await Evento.create({
      nombre: 'Espectáculo Visual - Wayra', descripcion: 'Experiencia inmersiva 360', fecha: new Date('2025-11-10T21:00:00'), hora: '21:00', precio: 8500, entradasDisponibles: 200, sala: salaTeatro._id, entidad: entidadesGuardadas[0]._id 
    });

    const eventoMusica = await Evento.create({
      nombre: 'Gran Concierto Sinfónico', descripcion: 'Show en vivo con orquesta completa', fecha: new Date('2026-12-28T22:00:00'), hora: '22:00', precio: 5000, entradasDisponibles: 120, sala: salaTeatro._id, entidad: entidadesGuardadas[2]._id 
    });

    const entradaPrueba = await Entrada.create({
      cliente: cliente1._id,
      evento: eventoCultural._id,
      nombre: 'General - Espectáculo Visual - Wayra',
      descripcion: 'Acceso adquirido para Espectáculo Visual - Wayra',
      precio: 8500,
      cantidad: 1,
      fila: 'Fila Única',
      asiento: 'General / Numerado',
      sector: 'General',
      estado: 'Completado',
      codigoBoleto: 'TICK-123456'
    });

    await Transaccion.create({
      cliente: cliente1._id,
      nombreCliente: 'cliente1',
      items: [
        {
          eventoId: eventoCultural._id.toString(),
          nombreEvento: eventoCultural.nombre,
          tipoEntrada: 'General',
          precio: 8500,
          cantidad: 1
        }
      ],
      subtotal: 8500,
      descuentoAplicado: 2550,
      total: 5950,
      medioPago: 'Tarjeta de Crédito',
      tarjetaUltimosDigitos: '1234',
      comprobanteId: 'REC-12345678',
      fechaCompra: new Date()
    });

    console.log('🎟️ Eventos, usuarios e historial de compras cargados correctamente.');
    console.log('✨ ¡Seed ejecutado por completo!');

  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exitCode = 1;
  } finally {
    if (esEjecucionDirecta) {
      await mongoose.disconnect();
    }
  }
}

export { conectarBaseDeDatos, poblarBaseDeDatos };

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  poblarBaseDeDatos();
}