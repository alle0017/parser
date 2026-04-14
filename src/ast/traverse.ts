import { TokenNotRecognizedError } from "../exceptions/index.ts";
import type { RToken, Token } from "../parser/index.d.ts";
import { Converter } from "./converter.ts";
import { Program } from "./program.ts";

export class Traverse extends Converter<void> {
      public readonly program: Program = new Program();

      public override addConversion(tokenType: string, conversion: (converter: Traverse, token: Token) => void): this {
            //@ts-ignore
            super.addConversion(tokenType, conversion);     
            return this;
      }
      public addRecursiveConversion(tokenType: string, conversion: (converter: Traverse, token: RToken) => void): this {
            this.addConversion(tokenType, (self, token) => {
                  if (!Array.isArray(token.$)) {
                        throw new TokenNotRecognizedError(token);
                  }
                  conversion(self, token as RToken);
            });
            return this;
      }
}