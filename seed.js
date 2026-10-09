// seed.js
global.crypto = require('crypto');
const mongoose = require('mongoose');

const Usuario = require('./models/Usuario');
const Sala = require('./models/Sala');
const Evento = require('./models/Evento');
const Entrada = require('./models/Entrada');

async function poblarBaseDeDatos() {
  try {
    await mongoose.connect('mongodb://localhost:27017/TP2');
    console.log('📦 Conectado a MongoDB para el Seed...');

    // Limpiar datos anteriores
    await Usuario.deleteMany({});
    await Sala.deleteMany({});
    await Evento.deleteMany({});
    await Entrada.deleteMany({});

    console.log('🧹 Base de datos limpiada correctamente.');

    // --- 1. CREACIÓN DE CLIENTES (Diferentes tipos) ---
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
      apellido: 'Gomez',
      email: 'maria.gomez@email.com',
      password: '123',
      dni: '87654321',
      fechaNacimiento: new Date('1990-08-20'),
      telefono: '1144556677',
      rol: 'Cliente',
      tipoCliente: 'PREMIUM',
      porcentajeDescuento: 0.15
    });

    const cliente3 = await Usuario.create({
      nombreUsuario: 'cliente3',
      nombre: 'Carlos',
      apellido: 'Lopez',
      email: 'carlos.lopez@email.com',
      password: '123',
      dni: '11223344',
      fechaNacimiento: new Date('2000-02-10'),
      telefono: '1199887766',
      rol: 'Cliente',
      tipoCliente: 'ESTANDAR',
      porcentajeDescuento: 0
    });

    // Administrador
    await Usuario.create({
      nombreUsuario: 'admin',
      nombre: 'Administrador',
      apellido: 'General',
      email: 'admin@email.com',
      password: '123',
      dni: '99887766',
      fechaNacimiento: new Date('1980-01-01'),
      telefono: '1100112233',
      rol: 'Administrador'
    });

    console.log('👤 Clientes y Administrador creados correctamente.');

    // --- 2. CREACIÓN DE SALAS ---
    const salaTeatro = await Sala.create({
      nombre: 'Teatro Gran Rex',
      descripcion: 'Sala clásica de eventos masivos en el centro',
      capacidad: 500,
      ubicacion: 'Centro Histórico'
    });

    const salaAuditorio = await Sala.create({
      nombre: 'Auditorio Central Moderno',
      descripcion: 'Sala equipada con sonido Dolby Atmos y butacas reclinables',
      capacidad: 250,
      ubicacion: 'Zona Norte - Boulevard 40'
    });

    // --- 3. CREACIÓN DE EVENTOS (Pasados y Vigentes) ---
    // Evento Pasado (Historial)
    const eventoPasado = await Evento.create({
      nombre: 'Concierto de Rock Retró (Pasado)',
      descripcion: 'Festival de rock clásico',
      fecha: new Date('2025-11-10T21:00:00'),
      hora: '21:00',
      entradasDisponibles: 0,
      sala: salaTeatro._id
    });

    // Evento Vigente 1 (Único para Cliente 1)
    const eventoVigente1 = await Evento.create({
      nombre: 'Festival de Cine Independiente 2026',
      descripcion: 'Exhibición de películas nominadas',
      fecha: new Date('2026-12-15T19:30:00'),
      hora: '19:30',
      entradasDisponibles: 85,
      sala: salaAuditorio._id
    });

    // Evento Vigente 2 (COMPARTIDO / REPETIDO entre Cliente 1 y Cliente 2)
    const eventoCompartido = await Evento.create({
      nombre: 'Gran Concierto Sinfónico de Fin de Año',
      descripcion: 'Orquesta en vivo con invitados especiales',
      fecha: new Date('2026-12-28T22:00:00'),
      hora: '22:00',
      entradasDisponibles: 120,
      sala: salaTeatro._id
    });

    console.log('🎭 Salas y Eventos creados correctamente.');

    // --- 4. CREACIÓN DE COMPRAS / ENTRADAS ASOCIADAS ---
    // Compra pasada del Cliente 1
    await Entrada.create({
      cliente: cliente1._id,
      evento: eventoPasado._id,
      nombre: 'Entrada VIP - Concierto Retró',
      descripcion: 'Acceso preferencial zona A',
      precio: 3500.00,
      cantidad: 2,
      estado: 'Completado (Historial)'
    });

    // Compra vigente del Cliente 1 para el evento 1
    await Entrada.create({
      cliente: cliente1._id,
      evento: eventoVigente1._id,
      nombre: 'Abono General - Cine',
      descripcion: 'Acceso a funciones principales',
      precio: 1500.00,
      cantidad: 1,
      estado: 'Confirmado'
    });

    // Compra COMPARTIDA: Cliente 1 también compró para el evento sinfónico
    await Entrada.create({
      cliente: cliente1._id,
      evento: eventoCompartido._id,
      nombre: 'Entrada Preferencial - Sinfónica',
      descripcion: 'Sector Fila 3',
      precio: 5000.00,
      cantidad: 2,
      estado: 'Confirmado'
    });

    // Compra COMPARTIDA: Cliente 2 compró para el MISMO evento sinfónico (Evento repetido/compartido)
    await Entrada.create({
      cliente: cliente2._id,
      evento: eventoCompartido._id,
      nombre: 'Entrada General - Sinfónica',
      descripcion: 'Sector General',
      precio: 4000.00,
      cantidad: 3,
      estado: 'Confirmado'
    });

    // Compra del Cliente 3 (Tipo estándar)
    await Entrada.create({
      cliente: cliente3._id,
      evento: eventoVigente1._id,
      nombre: 'Entrada Estándar - Cine',
      descripcion: 'Entrada general',
      precio: 1500.00,
      cantidad: 1,
      estado: 'Confirmado'
    });

    console.log('🎟️ Compras y entradas asociadas a múltiples clientes con éxito.');
    console.log('✨ ¡Seed ejecutado por completo!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

poblarBaseDeDatos();