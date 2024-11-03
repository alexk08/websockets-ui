export class PlayerError extends Error {
  constructor(msg?: string) {
    super(msg);
    this.name = 'PlayerError';
  }
}
