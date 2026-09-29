# TuTienda

**Dominio:** [A / B / C / D — nombre]
**Base de datos:** MongoDB + Mongoose
**Organización del backend:** [Carpeta por tipo de archivo / Carpeta por módulo]

## Integrantes
- Colman, Maximo Javier Alexis — MaxiColmena
- Martinez, Javier Nicolas — JavierNicolasMartinez
- Peryra Roman. Ramiro Nicolas - ramirorn

## Descripción
[Dos o tres oraciones sobre qué hace la aplicación.]

## Requisitos previos
- Docker y Docker Compose
- Git
- (Opcional, para desarrollo local) Node.js [versión]

## Cómo ejecutar el proyecto

1. Clonar el repositorio:
   ```bash
   git clone [url]
   cd [carpeta]
   ```
2. Crear el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Levantar los servicios:
   ```bash
   docker compose up --build
   ```
4. [Si el seed no es automático, indicar el comando exacto.]
5. Abrir la aplicación:
   - Frontend: http://localhost:[puerto]
   - API: http://localhost:[puerto]/api

## Ejecución sin Docker (opcional)
[Pasos para correr backend y frontend por separado, cada uno desde su carpeta.]

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de la base de datos | `db` |
| `DB_PORT` | Puerto de la base de datos | `5432` / `27017` |
| `DB_USER` | Usuario | `tlp4` |
| `DB_PASSWORD` | Contraseña | `tlp4` |
| `DB_NAME` | Nombre de la base | `tp_integrador` |
| `JWT_SECRET` | Clave para firmar los tokens | `cambiar-esto` |
| `API_PORT` | Puerto del backend | `3000` |
| `VITE_API_URL` | URL de la API para el frontend | `http://localhost:3000/api` |

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@tp.com | [contraseña] |
| operador | operador@tp.com | [contraseña] |
| usuario | usuario@tp.com | [contraseña] |

## Cómo probar el flujo de notificaciones
1. Ingresar como `usuario` y suscribirse a un [recurso].
2. En otra ventana (o en incógnito), ingresar como `operador` y cambiar el estado de ese [recurso].
3. Volver a la sesión de `usuario`: la notificación aparece en la bandeja.
4. Verificar la notificación en la consola del backend:
   ```bash
   docker compose logs backend
   ```

## Endpoints principales

| Método | Ruta | Permiso requerido |
|---|---|---|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| GET | /api/[recursos] | [recurso]:read |
| ... | ... | ... |

## Patrones y principios SOLID
Ver [PATTERNS.md](./PATTERNS.md).
