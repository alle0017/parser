export class NoValidTokenError extends Error {
      constructor(char: string) {
            super('no valid token was found for given sequence of characters: ' + char);
      }
}