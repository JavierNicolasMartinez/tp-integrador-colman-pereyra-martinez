import type { IObserver } from './IObserver.ts';

// Subject: mantiene la lista de observers y les avisa cuando ocurre un evento
export interface ISubject<TEvent> {
  attach(observer: IObserver<TEvent>): void;
  detach(observer: IObserver<TEvent>): void;
  notify(event: TEvent): Promise<void>;
}
