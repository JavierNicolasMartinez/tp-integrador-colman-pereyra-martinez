// Composition root: único lugar donde se crean todos los objetos y se conectan
// entre sí. Las dependencias se inyectan por constructor.
import { createApp } from './app.ts';
import { env } from './config/env.ts';
import { AuthController } from './controllers/AuthController.ts';
import { NotificationController } from './controllers/NotificationController.ts';
import { SubscriptionController } from './controllers/SubscriptionController.ts';
import { TicketController } from './controllers/TicketController.ts';
import { UserController } from './controllers/UserController.ts';
import { DatabaseConnection } from './database/DatabaseConnection.ts';
import { seedDatabase } from './database/seed.ts';
import { createAuthenticate } from './middlewares/authenticate.ts';
import { NotifierFactory } from './notifications/NotifierFactory.ts';
import { EventPublisher } from './observer/EventPublisher.ts';
import { NotificationRepository } from './repositories/NotificationRepository.ts';
import { RoleRepository } from './repositories/RoleRepository.ts';
import { SubscriptionRepository } from './repositories/SubscriptionRepository.ts';
import { TicketRepository } from './repositories/TicketRepository.ts';
import { UserRepository } from './repositories/UserRepository.ts';
import { createAuthRoutes } from './routes/auth.routes.ts';
import { createNotificationRoutes } from './routes/notification.routes.ts';
import { createSubscriptionRoutes } from './routes/subscription.routes.ts';
import { createTicketRoutes } from './routes/ticket.routes.ts';
import { createUserRoutes } from './routes/user.routes.ts';
import { AuthService } from './services/AuthService.ts';
import { NotificationService } from './services/NotificationService.ts';
import { SubscriptionService } from './services/SubscriptionService.ts';
import { TicketService } from './services/TicketService.ts';
import { UserService } from './services/UserService.ts';

async function main(): Promise<void> {
  // 1. Base de datos: única instancia (Singleton) + seed automático
  const database = DatabaseConnection.getInstance();
  await database.connect();
  await seedDatabase();

  // 2. Repositorios (único acceso a la base)
  const userRepository = new UserRepository();
  const roleRepository = new RoleRepository();
  const ticketRepository = new TicketRepository();
  const subscriptionRepository = new SubscriptionRepository();
  const notificationRepository = new NotificationRepository();

  // 3. Notificaciones: Factory + Observer
  const notifierFactory = new NotifierFactory(notificationRepository);
  const notificationService = new NotificationService(
    subscriptionRepository,
    notificationRepository,
    notifierFactory
  );
  const eventPublisher = new EventPublisher();
  eventPublisher.attach(notificationService);

  // 4. Services
  const authService = new AuthService(userRepository, roleRepository, {
    jwtSecret: env.jwtSecret,
    jwtExpiresInSeconds: env.jwtExpiresInSeconds
  });
  const userService = new UserService(userRepository, roleRepository);
  const ticketService = new TicketService(
    ticketRepository,
    subscriptionRepository,
    notificationRepository,
    eventPublisher
  );
  const subscriptionService = new SubscriptionService(subscriptionRepository, ticketRepository);

  // 5. Controllers y rutas
  const authenticate = createAuthenticate(authService);
  const app = createApp({
    auth: createAuthRoutes(new AuthController(authService), authenticate),
    users: createUserRoutes(new UserController(userService), authenticate),
    tickets: createTicketRoutes(new TicketController(ticketService), authenticate),
    subscriptions: createSubscriptionRoutes(new SubscriptionController(subscriptionService), authenticate),
    notifications: createNotificationRoutes(new NotificationController(notificationService), authenticate)
  });

  const server = app.listen(env.apiPort, () => {
    console.log(`[API] Escuchando en http://localhost:${env.apiPort}/api`);
  });

  // Cierre ordenado (por ejemplo, al hacer docker compose down)
  const shutdown = (): void => {
    server.close(() => {
      void database.disconnect().then(() => process.exit(0));
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error: unknown) => {
  console.error('[API] No se pudo iniciar la aplicación:', error);
  process.exit(1);
});
