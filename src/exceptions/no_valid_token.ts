import { PToken } from "../parser/index.d.ts";

export class NoValidTokenError extends Error {
      constructor(char: string, tokens: PToken[] = []) {
            super('no valid token was found for given sequence of characters: ' + char + '\n' + tokens.map(t => `${t.type}(${t.$})`).join('\n'));
      }
}