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
  
  // Sincronizar e inicializar índices únicos de todos los modelos antes de operar
  await Promise.all([
    Usuario.init(),
    Sala.init(),
    Evento.init(),
    Entrada.init(),
    Transaccion.init(),
    Entidad.init()
  ]);
}

async function poblarBaseDeDatos() {
  const esEjecucionDirecta = process.argv[1] && path.resolve(process.argv[1]) === __filename;
  
  try {
    await conectarBaseDeDatos();
    console.log('📦 Conectado a MongoDB para seed...');

    // Limpieza de colecciones en orden secuencial
    await Entrada.deleteMany({});
    await Transaccion.deleteMany({});
    await Evento.deleteMany({});
    await Sala.deleteMany({});
    await Usuario.deleteMany({});
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

    // --- USUARIOS POR ROL ---
    const admin = await Usuario.create({
      nombreUsuario: 'admin',
      nombre: 'Administrador',
      apellido: 'Principal',
      email: 'admin@email.com',
      password: '123',
      dni: '99887766',
      fechaNacimiento: new Date('1980-01-01'),
      telefono: '1100112233',
      rol: 'Administrador',
      tipoCliente: 'VIP',
      porcentajeDescuento: 0.3
    });

    const supervisor = await Usuario.create({
      nombreUsuario: 'supervisor',
      nombre: 'Carlos',
      apellido: 'Gómez',
      email: 'supervisor@email.com',
      password: '123',
      dni: '33445566',
      fechaNacimiento: new Date('1988-03-20'),
      telefono: '1144556677',
      rol: 'Supervisor',
      tipoCliente: 'ESTANDAR',
      porcentajeDescuento: 0
    });

    const lector = await Usuario.create({
      nombreUsuario: 'lector',
      nombre: 'Lucía',
      apellido: 'Fernández',
      email: 'lector@email.com',
      password: '123',
      dni: '44556677',
      fechaNacimiento: new Date('1992-07-10'),
      telefono: '1155667788',
      rol: 'Lector',
      tipoCliente: 'ESTANDAR',
      porcentajeDescuento: 0
    });

    const cliente1 = await Usuario.create({
      nombreUsuario: 'cliente1',
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan.perez@email.com',
      password: '123',
      dni: '12345678',
      fechaNacimiento: new Date('1995-05-15'),
      telefono: '1122334455',
      rol: 'Cliente',
      tipoCliente: 'VIP',
      porcentajeDescuento: 0.3
    });

    const cliente2 = await Usuario.create({
      nombreUsuario: 'cliente2',
      nombre: 'Maria',
      apellido: 'Lopez',
      email: 'maria.lopez@email.com',
      password: '123',
      dni: '23456789',
      fechaNacimiento: new Date('2000-11-22'),
      telefono: '1133445566',
      rol: 'Cliente',
      tipoCliente: 'ESTANDAR',
      porcentajeDescuento: 0
    });

    // --- SALAS Y EVENTOS ---
    const salaTeatro = await Sala.create({
      nombre: 'Teatro Gran Rex',
      descripcion: 'Sala clásica céntrica',
      capacidad: 500,
      zonas: { General: 300, Platea: 150, VIP: 50 },
      ubicacion: 'Centro Histórico'
    });

    const eventoCultural = await Evento.create({
      nombre: 'Espectáculo Visual - Wayra',
      descripcion: 'Experiencia inmersiva 360',
      fecha: new Date('2025-11-10T21:00:00'),
      hora: '21:00',
      precio: 8500,
      entradasDisponibles: 195,
      sala: salaTeatro._id,
      entidad: entidadesGuardadas[0]._id 
    });

    const eventoMusica = await Evento.create({
      nombre: 'Gran Concierto Sinfónico',
      descripcion: 'Show en vivo con orquesta completa',
      fecha: new Date('2026-12-28T22:00:00'),
      hora: '22:00',
      precio: 5000,
      entradasDisponibles: 116,
      sala: salaTeatro._id,
      entidad: entidadesGuardadas[2]._id 
    });

    // --- ENTRADAS COMPRADAS ---
    await Entrada.create([
      {
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
        codigoBoleto: 'TICK-100001'
      },
      {
        cliente: cliente1._id,
        evento: eventoMusica._id,
        nombre: 'Platea - Gran Concierto Sinfónico',
        descripcion: 'Acceso adquirido para Gran Concierto Sinfónico',
        precio: 5000,
        cantidad: 2,
        fila: 'Fila 4',
        asiento: 'Platea / 12, 13',
        sector: 'Platea',
        estado: 'Completado',
        codigoBoleto: 'TICK-100002'
      },
      {
        cliente: cliente2._id,
        evento: eventoCultural._id,
        nombre: 'General - Espectáculo Visual - Wayra',
        descripcion: 'Acceso adquirido para Espectáculo Visual - Wayra',
        precio: 8500,
        cantidad: 2,
        fila: 'Fila Única',
        asiento: 'General / Numerado',
        sector: 'General',
        estado: 'Completado',
        codigoBoleto: 'TICK-100003'
      },
      {
        cliente: cliente2._id,
        evento: eventoMusica._id,
        nombre: 'VIP - Gran Concierto Sinfónico',
        descripcion: 'Acceso VIP adquirido para Gran Concierto Sinfónico',
        precio: 8000,
        cantidad: 2,
        fila: 'Fila 1',
        asiento: 'VIP / 05, 06',
        sector: 'VIP',
        estado: 'Completado',
        codigoBoleto: 'TICK-100004'
      }
    ]);

    // --- HISTORIAL DE TRANSACCIONES / PAGOS ---
    await Transaccion.create([
      {
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
        tarjetaUltimosDigitos: '4321',
        comprobanteId: 'REC-98234101',
        fechaCompra: new Date('2026-10-01T14:30:00')
      },
      {
        cliente: cliente1._id,
        nombreCliente: 'cliente1',
        items: [
          {
            eventoId: eventoMusica._id.toString(),
            nombreEvento: eventoMusica.nombre,
            tipoEntrada: 'Platea',
            precio: 5000,
            cantidad: 2
          }
        ],
        subtotal: 10000,
        descuentoAplicado: 3000,
        total: 7000,
        medioPago: 'Mercado Pago',
        tarjetaUltimosDigitos: '8812',
        comprobanteId: 'REC-98234102',
        fechaCompra: new Date('2026-10-05T18:15:00')
      },
      {
        cliente: cliente2._id,
        nombreCliente: 'cliente2',
        items: [
          {
            eventoId: eventoCultural._id.toString(),
            nombreEvento: eventoCultural.nombre,
            tipoEntrada: 'General',
            precio: 8500,
            cantidad: 2
          }
        ],
        subtotal: 17000,
        descuentoAplicado: 0,
        total: 17000,
        medioPago: 'Tarjeta de Débito',
        tarjetaUltimosDigitos: '5543',
        comprobanteId: 'REC-98234103',
        fechaCompra: new Date('2026-10-08T10:20:00')
      },
      {
        cliente: cliente2._id,
        nombreCliente: 'cliente2',
        items: [
          {
            eventoId: eventoMusica._id.toString(),
            nombreEvento: eventoMusica.nombre,
            tipoEntrada: 'VIP',
            precio: 8000,
            cantidad: 2
          }
        ],
        subtotal: 16000,
        descuentoAplicado: 0,
        total: 16000,
        medioPago: 'Tarjeta de Crédito',
        tarjetaUltimosDigitos: '9011',
        comprobanteId: 'REC-98234104',
        fechaCompra: new Date('2026-10-10T20:45:00')
      }
    ]);

    console.log('🎟️ Múltiples clientes, entradas y transacciones de pagos cargadas con éxito.');
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