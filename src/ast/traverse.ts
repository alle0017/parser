import type { Token } from "../parser/index.d.ts";
import { Converter } from "./converter.ts";
import { Program } from "./program.ts";

export class Traverse extends Converter<void> {
      public readonly program: Program = new Program();

      public override addConversion(tokenType: string, conversion: (converter: Traverse, token: Token) => void): this {
            //@ts-ignore
            super.addConversion(tokenType, conversion);     
            return this;
      }
}