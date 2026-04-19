import { Converter } from "../../src/ast/converter.ts";
import { Func, Ir, TypedSymbol } from "../../src/ast/ir.ts";
import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Tokens } from "../grammar_gen.ts";
export class FunctionGrammar extends SemanticAction {
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.ARG, (self, token) => [new TypedSymbol(token.$[0].$ as string, token.$[2].$ as string)])
            .addRecursiveConversion(Tokens.ARG_LIST, (self, token) => {
                  const res = self.convert(token.$[0]);
                  if (token.$.length == 3) {
                        res.push(...self.convert(token.$[2]));
                  }
                  return res;
            })
            .addRecursiveConversion(Tokens.FUNCTION, (self, token) => {
                  const name = token.$[1].$ as string;
                  const type = token.$.at(-2)?.$ as string;
                  const args: TypedSymbol[] = [];

                  if (token.$.length == 8) {
                        args.push(...self.convert(token.$[3]) as TypedSymbol[]);
                  }
                  return [new Func(new TypedSymbol(name,type), args, self.convert(token.$.at(-1)!))];
            })
      }
}