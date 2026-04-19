import { SemanticAction } from "../../grammar/semantic_action.ts";
import { Converter } from "../../src/ast/converter.ts";
import { Ir } from "../../src/ast/ir.ts";
import { Tokens } from "../grammar_gen.ts";
export class BaseGrammar extends SemanticAction {
      public override convert(traverser: Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.EXPRESSION_LIST, (self, token) => {
                  const res = self.convert(token.$[0]);

                  if (token.$.length == 2) {
                        res.push(...self.convert(token.$[1]));
                  }
                  return res;
            })
            .addRecursiveConversion(Tokens.EXPRESSION, (self, token) => self.convertAll(token.$).flat())
            .addRecursiveConversion(Tokens.CODE_BLOCK, (self, token) => self.convert(token.$[1]))
      }
}