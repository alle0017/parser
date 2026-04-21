import type { Token, RToken, PToken } from './index.d.ts';
import { Optional } from '../utils/optional.ts';
import { TokenNotRecognizedError } from '../exceptions/token_not_recognized.ts';
export function matches(token: Token, match: RegExp) {
      if (Array.isArray(token.$)) {
            return match.exec(token.$.join(' '));
      }
      return match.exec(token.type);
}
export function asPToken(token: Token) {
      if (Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      return token as PToken;
}
export function toRToken(token: Token) {
      if (!Array.isArray(token.$)) {
            throw new TokenNotRecognizedError(token);
      }
      return token as RToken;
}
export function getAllChildrenOfType(token: RToken, type: string) {
      return token.$.filter(token => token.type === type);
}

export function getFirstChildOfType(token: RToken, type: string) {
      return Optional.ofNullable(getAllChildrenOfType(token, type)[0]);
}

export function getFirstAsString(token: RToken, type: string) {
      return getFirstChildOfType(token, type).mapNullify(token => Array.isArray(token.$) ? null: token.$);
}

export function getLastChildOfType(token: RToken, type: string) {
      return Optional.ofNullable<Token>(getAllChildrenOfType(token, type).at(-1));
}

export function keepChildrenOfTypes(token: RToken, ...types: string[]) {
      const set = new Set(types);
      return token.$.filter(token => set.has(token.type));
}

export function hasXChildren(token: RToken, n: number) {
      return token.$.length == n;
}