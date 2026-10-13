import type { INotifier, Notification } from './INotifier.ts';

// Forma de console.log: recibe texto y no devuelve nada
type TextOutput = (message: string) => void;

// Adapter: la aplicación espera un INotifier (recibe un objeto Notification y
// devuelve una promesa), pero console.log recibe texto y no devuelve nada.
// Esta clase traduce entre las dos formas.
export class ConsoleNotifierAdapter implements INotifier {
  // El objeto adaptado se recibe por constructor (por defecto, console.log)
  constructor(private readonly output: TextOutput = (message) => console.log(message)) {}

  async send(notification: Notification): Promise<void> {
    this.output(this.format(notification));
  }

  // Ej: [NOTIFICACIÓN] Para: usuario@tp.com | Ticket #665f... "No anda el wifi" | Estado: ABIERTO → EN_PROGRESO
  private format(notification: Notification): string {
    return (
      `[NOTIFICACIÓN] Para: ${notification.userEmail} | ` +
      `Ticket #${notification.ticketId} "${notification.ticketTitle}" | ` +
      `Estado: ${notification.previousStatus} → ${notification.newStatus}`
    );
  }
}