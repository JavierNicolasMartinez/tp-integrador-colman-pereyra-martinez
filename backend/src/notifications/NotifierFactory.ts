import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository.ts';
import { ConsoleNotifierAdapter } from './ConsoleNotifierAdapter.ts';
import { InAppNotifier } from './InAppNotifier.ts';
import type { INotifier } from './INotifier.ts';

export type NotifierChannel = 'inapp' | 'console';

// Factory: único lugar donde se crean los canales con `new`.
// NotificationService le pide un canal por su tipo y solo conoce INotifier.
// Agregar un canal nuevo = crear su clase + un `case` acá, sin tocar NotificationService.
export class NotifierFactory {
  // Recibe por constructor lo que necesitan los canales (InAppNotifier usa el repositorio)
  constructor(private readonly notificationRepository: INotificationRepository) {}

  create(channel: NotifierChannel): INotifier {
    switch (channel) {
      case 'inapp':
        return new InAppNotifier(this.notificationRepository);
      case 'console':
        return new ConsoleNotifierAdapter();
      default: {
        // Si se agrega un tipo a NotifierChannel y falta su case, TypeScript marca error acá
        const unknownChannel: never = channel;
        throw new Error(`Canal de notificación desconocido: ${String(unknownChannel)}`);
      }
    }
  }
}