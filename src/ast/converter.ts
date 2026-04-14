import { TokenNotRecognizedError } from "../exceptions/index.ts";
import { Token } from "../parser/index.d.ts";

type ConverterFunction<T> = (converter: Converter<T>, token: Token) => T;

export class Converter<T> {
      private readonly conversion: Map<string, ConverterFunction<T>> = new Map();
      private readonly context: Map<string, unknown> = new Map();

      public addConversion(tokenType: string, conversion: ConverterFunction<T>): this {
            this.conversion.set(tokenType, conversion);
            return this;
      }
      public convert(token: Token): T {
            const node = this.conversion.get(token.type);

            if (!node) {
                  throw new TokenNotRecognizedError(token);
            }
            
            return node(this, token)
      }
      public convertAll(tokens: Token[]): T[] {
            return tokens.map(token => this.convert(token));
      }

      public getContext<K>(key: string): K {
            return this.context.get(key) as K;
      }
      public setContext(key: string, data: unknown): this {
            this.context.set(key, data);
            return this;
      }
      public saveContext(): MapIterator<[string, unknown]> {
            return this.context.entries();
      }
      public restoreContext(previousState: MapIterator<[string, unknown]>): void {
            this.context.clear();
            for (const [key, data] of previousState) {
                  this.context.set(key, data);
            }
      }
}