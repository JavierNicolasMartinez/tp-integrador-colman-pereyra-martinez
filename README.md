# Mesa de Ayuda — TP Integrador TLP IV

**Dominio:** A — Mesa de ayuda (recurso principal: Ticket)
**Base de datos:** MongoDB + Mongoose
**Organización del backend:** Carpeta por tipo de archivo

## Integrantes
- Colman, Maximo Javier Alexis — MaxiColmena
- Martinez, Javier Nicolas — JavierNicolasMartinez
- Pereyra Roman, Ramiro Nicolas — ramirorn

## Descripción
Aplicación de mesa de ayuda donde los usuarios consultan tickets y se suscriben a los que les interesan. Cada vez que un operador o administrador cambia el estado de un ticket (`ABIERTO`, `EN_PROGRESO`, `RESUELTO`, `CERRADO`), todos sus suscriptores reciben una notificación en la aplicación y se registra una línea en la consola del backend. El acceso a cada acción se controla con roles y permisos validados en el backend.

## Requisitos previos
- Docker y Docker Compose
- Git
- (Opcional, para desarrollo local) Node.js 24

## Cómo ejecutar el proyecto

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/JavierNicolasMartinez/tp-integrador-colman-pereyra-martinez.git
   cd tp-integrador-colman-pereyra-martinez
   ```
2. Crear el archivo de variables de entorno:
   ```bash
   cp .env.example .env
   ```
3. Levantar los servicios:
   ```bash
   docker compose up --build
   ```
4. El seed es **automático**: al arrancar, el backend crea los permisos, los roles y los usuarios de prueba (se puede ejecutar varias veces sin duplicar datos).
5. Abrir la aplicación:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000/api (verificación: http://localhost:3000/api/health)

## Ejecución sin Docker (opcional)
Requiere Node.js 24 y una base MongoDB. La forma más simple es levantar solo la base con Docker:

```bash
docker compose up -d mongodb
```

Backend (lee el `.env` de la raíz; por defecto se conecta a Mongo en `localhost:27018`):
```bash
cd backend
npm install
npm run dev
```

Para ejecutar el seed a mano: `npm run seed` (desde `backend/`).

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de la base de datos (con Docker se usa `mongodb` automáticamente) | `localhost` |
| `DB_PORT` | Puerto de Mongo en la PC (con Docker el backend usa `27017` internamente) | `27018` |
| `DB_USER` | Usuario root de MongoDB | `admin` |
| `DB_PASSWORD` | Contraseña del usuario root | `1234` |
| `DB_NAME` | Nombre de la base | `tp_integrador` |
| `JWT_SECRET` | Clave para firmar los tokens | `cambiar-esto` |
| `JWT_EXPIRES_IN_SECONDS` | Duración del token en segundos | `28800` |
| `API_PORT` | Puerto del backend | `3000` |
| `FRONTEND_PORT` | Puerto del frontend | `5173` |
| `VITE_API_URL` | URL de la API para el frontend | `http://localhost:3000/api` |

## Usuarios de prueba

| Rol | Email | Contraseña |
|---|---|---|
| admin | admin@tp.com | admin123 |
| operador | operador@tp.com | operador123 |
| usuario | usuario@tp.com | usuario123 |

## Cómo probar el flujo de notificaciones
1. Ingresar como `usuario` y suscribirse a un ticket.
2. En otra ventana (o en incógnito), ingresar como `operador` y cambiar el estado de ese ticket.
3. Volver a la sesión de `usuario`: la notificación aparece en la bandeja.
4. Verificar la notificación en la consola del backend:
   ```bash
   docker compose logs backend
   ```
   Se ve una línea como:
   ```
   [NOTIFICACIÓN] Para: usuario@tp.com | Ticket #665f... "No anda el wifi" | Estado: ABIERTO → EN_PROGRESO
   ```

## Endpoints principales
Todas las rutas (salvo registro, login y health) requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Permiso requerido |
|---|---|---|
| POST | /api/auth/register | — |
| POST | /api/auth/login | — |
| GET | /api/auth/me | (logueado) |
| GET | /api/tickets | ticket:read |
| GET | /api/tickets/:id | ticket:read |
| POST | /api/tickets | ticket:create |
| PUT | /api/tickets/:id | ticket:update |
| PATCH | /api/tickets/:id/status | ticket:change-status |
| DELETE | /api/tickets/:id | ticket:delete |
| GET | /api/subscriptions | ticket:read |
| GET | /api/subscriptions/:ticketId | ticket:read |
| POST | /api/subscriptions | subscription:create |
| DELETE | /api/subscriptions/:ticketId | subscription:delete |
| GET | /api/notifications | notification:read |
| GET | /api/notifications/unread-count | notification:read |
| PATCH | /api/notifications/:id/read | notification:read |
| PATCH | /api/notifications/read-all | notification:read |
| GET | /api/users | user:read |
| PATCH | /api/users/:id/role | user:assign-role |

Sin token la API responde `401`; con token pero sin el permiso, `403`.

## Patrones y principios SOLID
Ver [PATTERNS.md](./PATTERNS.md).
