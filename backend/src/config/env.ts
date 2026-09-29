import 'dotenv/config';

// Si falta una variable obligatoria, la app no arranca y avisa cuál es
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} (ver .env.example)`);
  }
  return value;
}

export const env = {
  apiPort: Number(process.env['API_PORT'] ?? 3000),

  dbHost: required('DB_HOST'),
  dbPort: Number(process.env['DB_PORT'] ?? 27017),
  dbUser: required('DB_USER'),
  dbPassword: required('DB_PASSWORD'),
  dbName: required('DB_NAME'),

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresInSeconds: Number(process.env['JWT_EXPIRES_IN_SECONDS'] ?? 60 * 60 * 8) // 8 horas
} as const;
