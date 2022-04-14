export class WriteLogsError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'WriteLogsError';
  }
}