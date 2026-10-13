import mongoose from 'mongoose';

export const conectarDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TP2';
    const conexion = await mongoose.connect(uri);

    console.log(`📦 Conectado exitosamente a MongoDB: ${conexion.connection.host}`);
    return conexion;
  } catch (error) {
    console.error('❌ Error crítico al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};