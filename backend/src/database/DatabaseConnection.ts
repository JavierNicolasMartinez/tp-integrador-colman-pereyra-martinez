import mongoose, { type Connection } from 'mongoose';
import { env } from '../config/env.ts';

// Singleton: el constructor es privado y la única forma de obtener la instancia
// es getInstance(). Toda la aplicación comparte una única conexión a MongoDB.
export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;

  private constructor(private readonly uri: string) {}

  static getInstance(): DatabaseConnection {
    if (DatabaseConnection.instance === null) {
      DatabaseConnection.instance = new DatabaseConnection(buildMongoUri());
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    // Si ya está conectada, no se abre una segunda conexión
    if (this.isConnected()) return;

    await mongoose.connect(this.uri, { serverSelectionTimeoutMS: 5000 });
    // No se muestra la URI completa para no imprimir la contraseña
    console.log(`[DB] Conectado a MongoDB en ${env.dbHost}:${env.dbPort}/${env.dbName}`);
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
  }

  getConnection(): Connection {
    return mongoose.connection;
  }

  isConnected(): boolean {
    return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
  }
}

function buildMongoUri(): string {
  const user = encodeURIComponent(env.dbUser);
  const password = encodeURIComponent(env.dbPassword);
  // authSource=admin: el usuario root de la imagen de Mongo se crea en la base "admin"
  return `mongodb://${user}:${password}@${env.dbHost}:${env.dbPort}/${env.dbName}?authSource=admin`;
}