export class RenameFileError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'RenameFileError';
  }
}