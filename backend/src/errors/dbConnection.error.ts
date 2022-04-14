export class DbConnectionError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'DBConnectionError';
  }
}