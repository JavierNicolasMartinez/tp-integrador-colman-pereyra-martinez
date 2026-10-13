import mongoose, { Schema, Document } from 'mongoose';
import { TICKET_STATUSES, type TicketStatus } from './Ticket.ts';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;   // el suscriptor que recibe el aviso
  ticket: mongoose.Types.ObjectId; // el ticket que cambió de estado
  previousStatus: TicketStatus;
  newStatus: TicketStatus;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
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
    },
    previousStatus: {
      type: String,
      enum: TICKET_STATUSES,
      required: true
    },
    newStatus: {
      type: String,
      enum: TICKET_STATUSES,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false // arranca como no leída
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
