import mongoose from "mongoose";
import Usuario from "../models/Usuario.js";
import Sala from "../models/Sala.js";
import Evento from "../models/Evento.js";
import Entrada from "../models/Entrada.js";

const poblar = async () => {
    try {
        const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/urbana_cult";
        await mongoose.connect(uri);
        console.log("Conectado exitosamente a la Base de Datos para el seed");

        // Limpiar base de datos antes de poblar para evitar duplicados
        await Usuario.deleteMany({});
        await Sala.deleteMany({});
        await Evento.deleteMany({});
        await Entrada.deleteMany({});

        // 1. Crear usuarios de prueba
        await Usuario.create({
            nombre: "Administrador",
            apellido: "General",
            dni: "12345678",
            correo: "admin@urbanacult.com",
            cumpleaños: "01/01/1990",
            username: "admin",
            password: "admin",
            rol: "Admin"
        });

        const cliente1 = await Usuario.create({
            nombre: "Juan",
            apellido: "Pérez",
            dni: "87654321",
            correo: "cliente@urbanacult.com",
            cumpleaños: "15/05/1995",
            username: "cliente",
            password: "cliente",
            rol: "Cliente"
        });

        const cliente2 = await Usuario.create({
            nombre: "María",
            apellido: "Gómez",
            dni: "44332211",
            correo: "maria@urbanacult.com",
            cumpleaños: "20/10/1998",
            username: "mariagomez",
            password: "password123",
            rol: "Cliente"
        });

        // 2. Crear salas de prueba
        const sala1 = await Sala.create({
            nombre: "Sala A - Teatro Principal",
            capacidad: 150,
            ubicacion: "Planta Baja / Sector Norte",
            descripcion: "Sala principal para grandes conciertos y obras de teatro.",
            zonas: { General: 80, Platea: 50, VIP: 20 }
        });

        const sala2 = await Sala.create({
            nombre: "Sala B - Auditorio Under",
            capacidad: 80,
            ubicacion: "Subsuelo / Sector Sur",
            descripcion: "Espacio íntimo para música independiente y stand-up.",
            zonas: { General: 50, Platea: 20, VIP: 10 }
        });

        // 3. Crear eventos con stock inicial configurado
        const evento1 = await Evento.create({
            titulo: "Concierto de Rock Urbano",
            artista: "The Cults",
            descripcion: "Una noche inolvidable a puro rock alternativo e independiente.",
            sala: sala1._id,
            fecha: "2026-12-31",
            hora: "21:00",
            precio: 1500,
            entradasDisponibles: 100 
        });

        const evento2 = await Evento.create({
            titulo: "Festival de Jazz Nocturno",
            artista: "Blue Note Quintet",
            descripcion: "Los mejores exponentes del jazz moderno en vivo.",
            sala: sala2._id,
            fecha: "2026-11-15",
            hora: "22:30",
            precio: 2200,
            entradasDisponibles: 80 
        });

        const evento3 = await Evento.create({
            titulo: "Stand Up Comedy Night",
            artista: "Carlos Standupero",
            descripcion: "Risas garantizadas con el nuevo show de comedia en vivo.",
            sala: sala2._id,
            fecha: "2026-10-20",
            hora: "20:00",
            precio: 1000,
            entradasDisponibles: 50 
        });

        // 4. Crear entradas iniciales de prueba
        await Entrada.create({
            usuario: cliente1._id,
            evento: evento1._id,
            cantidad: 1,
            metodoPago: "Tarjeta de Crédito",
            estado: "Valida",
            fechaCompra: new Date()
        });

        await Entrada.create({
            usuario: cliente2._id,
            evento: evento2._id,
            cantidad: 2,
            metodoPago: "Tarjeta de Crédito",
            estado: "Valida",
            fechaCompra: new Date()
        });

        console.log("🌱 Base de datos poblada exitosamente con stock y transacciones.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error en seed:", error);
        process.exit(1);
    }
};

poblar();