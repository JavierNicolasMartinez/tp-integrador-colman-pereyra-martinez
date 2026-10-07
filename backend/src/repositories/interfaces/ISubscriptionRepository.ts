// Datos planos que devuelve el repositorio: los services no dependen de Mongoose
export interface SubscriptionRecord {
  id: string;
  userId: string;
  ticketId: string;
  createdAt: Date;
}

// Lo que necesita el NotificationService para avisarle a cada suscriptor
export interface Subscriber {
  userId: string;
  email: string;
}

export interface ISubscriptionRepository {
  create(userId: string, ticketId: string): Promise<SubscriptionRecord>;
  delete(userId: string, ticketId: string): Promise<boolean>; // true si existía
  exists(userId: string, ticketId: string): Promise<boolean>;
  findByUser(userId: string): Promise<SubscriptionRecord[]>;
  findSubscribersByTicket(ticketId: string): Promise<Subscriber[]>;
  deleteByTicket(ticketId: string): Promise<number>; // al eliminar un ticket
}