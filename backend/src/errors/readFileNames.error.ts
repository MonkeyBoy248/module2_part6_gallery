export class ReadFileNamesError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'ReadFileNamesError';
  }
}