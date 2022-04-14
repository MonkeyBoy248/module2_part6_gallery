export class CopyToStorageError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'CopyToStorageError';
  }
}