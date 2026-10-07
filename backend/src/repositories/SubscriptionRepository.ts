import { isValidObjectId } from 'mongoose';
import Subscription, { type ISubscription } from '../models/Subscription.ts';
import User, { type IUser } from '../models/User.ts';
import type {
  ISubscriptionRepository,
  Subscriber,
  SubscriptionRecord
} from './interfaces/ISubscriptionRepository.ts';

// Convierte el documento de Mongoose en datos planos para los services
function toSubscriptionRecord(doc: ISubscription): SubscriptionRecord {
  return {
    id: String(doc._id),
    userId: String(doc.user),
    ticketId: String(doc.ticket),
    createdAt: doc.createdAt
  };
}

export class SubscriptionRepository implements ISubscriptionRepository {
  async create(userId: string, ticketId: string): Promise<SubscriptionRecord> {
    const doc = await Subscription.create({ user: userId, ticket: ticketId });
    return toSubscriptionRecord(doc);
  }

  async delete(userId: string, ticketId: string): Promise<boolean> {
    if (!isValidObjectId(ticketId)) return false;

    const result = await Subscription.deleteOne({ user: userId, ticket: ticketId });
    return result.deletedCount > 0;
  }

  async exists(userId: string, ticketId: string): Promise<boolean> {
    if (!isValidObjectId(ticketId)) return false;

    const found = await Subscription.exists({ user: userId, ticket: ticketId });
    return found !== null;
  }

  async findByUser(userId: string): Promise<SubscriptionRecord[]> {
    const docs = await Subscription.find({ user: userId }).sort({ createdAt: -1 });
    return docs.map(toSubscriptionRecord);
  }

  async findSubscribersByTicket(ticketId: string): Promise<Subscriber[]> {
    if (!isValidObjectId(ticketId)) return [];

    // Se trae solo el email del usuario. Se indica el modelo para que User quede registrado.
    const docs = await Subscription.find({ ticket: ticketId }).populate<{ user: IUser | null }>({
      path: 'user',
      model: User,
      select: 'email'
    });

    // Si un usuario fue eliminado, populate devuelve null: se lo saltea
    return docs.flatMap((doc) =>
      doc.user ? [{ userId: String(doc.user._id), email: doc.user.email }] : []
    );
  }

  async deleteByTicket(ticketId: string): Promise<number> {
    if (!isValidObjectId(ticketId)) return 0;

    const result = await Subscription.deleteMany({ ticket: ticketId });
    return result.deletedCount;
  }
}