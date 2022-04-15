export class signUpError extends Error {
  constructor(message? : string) {
    super(message);
    this.name = 'signUpError';
  }
}