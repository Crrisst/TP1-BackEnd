global.crypto = require('crypto');
const mongoose = require('mongoose');

const Usuario = require('./models/Usuario');
const Sala = require('./models/Sala');
const Evento = require('./models/Evento');
const Entrada = require('./models/Entrada');
const Transaccion = require('./models/Transaccion');

// CONEXIÓN A LA BASE DE DATOS
async function conectarBaseDeDatos() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TP2');
  await Sala.init();
}

// CARGA DE DATOS DE EJEMPLO POR MÓDULO
async function poblarBaseDeDatos() {
  try {
    await conectarBaseDeDatos();
    console.log('📦 Conectado a MongoDB para el Seed...');

    await Usuario.deleteMany({});
    await Sala.deleteMany({});
    await Evento.deleteMany({});
    await Entrada.deleteMany({});
    await Transaccion.deleteMany({});

    console.log('🧹 Base de datos limpiada correctamente.');

    // 1. CLIENTES
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

    // 2. SALAS
    const salaTeatro = await Sala.create({
      nombre: 'Teatro Gran Rex',
      descripcion: 'Sala clásica de eventos masivos en el centro',
      capacidad: 500,
      zonas: {
        General: 300,
        Platea: 150,
        VIP: 50
      },
      ubicacion: 'Centro Histórico'
    });

    const salaAuditorio = await Sala.create({
      nombre: 'Auditorio Central Moderno',
      descripcion: 'Sala equipada con sonido Dolby Atmos y reclinables',
      capacidad: 250,
      zonas: {
        General: 150,
        Platea: 75,
        VIP: 25
      },
      ubicacion: 'Zona Norte'
    });

    // 3. EVENTOS
    const eventoPasado = await Evento.create({
      nombre: 'Concierto de Rock Retró (Pasado)',
      descripcion: 'Festival de rock clásico',
      fecha: new Date('2025-11-10T21:00:00'),
      hora: '21:00',
      precio: 3500,
      entradasDisponibles: 50,
      sala: salaTeatro._id
    });

    const eventoVigente1 = await Evento.create({
      nombre: 'Festival de Cine Independiente 2026',
      descripcion: 'Exhibición de películas nominadas',
      fecha: new Date('2026-12-15T19:30:00'),
      hora: '19:30',
      precio: 1500,
      entradasDisponibles: 85,
      sala: salaAuditorio._id
    });

    const eventoCompartido = await Evento.create({
      nombre: 'Gran Concierto Sinfónico de Fin de Año',
      descripcion: 'Orquesta en vivo con invitados especiales',
      fecha: new Date('2026-12-28T22:00:00'),
      hora: '22:00',
      precio: 5000,
      entradasDisponibles: 120,
      sala: salaTeatro._id
    });

    // 4. ENTRADAS VINCULADAS
    await Entrada.create({
      cliente: cliente1._id,
      evento: eventoPasado._id,
      sector: 'VIP',
      nombre: 'Entrada VIP - Concierto Retró',
      descripcion: 'Acceso preferencial zona A',
      precio: 3500.00,
      cantidad: 2,
      estado: 'Completado'
    });

    await Entrada.create({
      cliente: cliente1._id,
      evento: eventoVigente1._id,
      sector: 'General',
      nombre: 'Abono General - Cine',
      descripcion: 'Acceso a funciones principales',
      precio: 1500.00,
      cantidad: 1,
      estado: 'Confirmado'
    });

    // 5. TRANSACCIONES / RECIBOS DE EJEMPLO
    await Transaccion.create({
      cliente: cliente1._id,
      nombreCliente: cliente1.nombreUsuario,
      items: [
        {
          eventoId: eventoPasado._id.toString(),
          nombreEvento: eventoPasado.nombre,
          tipoEntrada: 'VIP',
          precio: 3500,
          cantidad: 2
        }
      ],
      total: 7000,
      medioPago: 'Tarjeta de Crédito',
      tarjetaUltimosDigitos: '4321',
      comprobanteId: 'REC-98234112',
      fechaCompra: new Date('2025-11-01T15:30:00')
    });

    await Transaccion.create({
      cliente: cliente1._id,
      nombreCliente: cliente1.nombreUsuario,
      items: [
        {
          eventoId: eventoVigente1._id.toString(),
          nombreEvento: eventoVigente1.nombre,
          tipoEntrada: 'General',
          precio: 1500,
          cantidad: 1
        },
        {
          eventoId: eventoCompartido._id.toString(),
          nombreEvento: eventoCompartido.nombre,
          tipoEntrada: 'VIP',
          precio: 5000,
          cantidad: 2
        }
      ],
      total: 11500,
      medioPago: 'Mercado Pago',
      tarjetaUltimosDigitos: '8899',
      comprobanteId: 'REC-10293847',
      fechaCompra: new Date('2026-10-01T18:20:00')
    });

    console.log('🎟️ Transacciones y comprobantes cargados correctamente.');
    console.log('✨ ¡Seed ejecutado por completo!');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

module.exports = { conectarBaseDeDatos };

if (require.main === module) {
  poblarBaseDeDatos();
}