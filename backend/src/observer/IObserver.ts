// Observer: objeto que reacciona cuando el Subject publica un evento
export interface IObserver<TEvent> {
  update(event: TEvent): Promise<void>;
}
