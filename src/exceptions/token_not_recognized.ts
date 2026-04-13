import type { Token } from '../parser/index.d.ts';
export class TokenNotRecognizedError extends Error {
      constructor(token: Token) {
            super(`token not recognized: ${typeof token.$ == 'string' ? `Token[type: ${token.type}](${token.$})`: '[ComplexToken]'}`);
      }
}