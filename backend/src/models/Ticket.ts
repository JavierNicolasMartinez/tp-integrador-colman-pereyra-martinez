import mongoose, { Schema, Document } from 'mongoose';

// Estados centralizados: se reutilizan en el service, el Observer y Notification
export const TICKET_STATUSES = ['ABIERTO', 'EN_PROGRESO', 'RESUELTO', 'CERRADO'] as const;
export type TicketStatus = typeof TICKET_STATUSES[number];

export interface ITicket extends Document {
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: TICKET_STATUSES,
      default: 'ABIERTO',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ITicket>('Ticket', TicketSchema);
