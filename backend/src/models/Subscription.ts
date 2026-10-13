import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Índice único: un usuario no puede suscribirse dos veces al mismo ticket
SubscriptionSchema.index({ user: 1, ticket: 1 }, { unique: true });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
