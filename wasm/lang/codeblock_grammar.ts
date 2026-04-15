import { Converter } from "../../src/ast/converter.ts";
import { Ir } from "../../src/ast/ir.ts";
import { Grammar } from "../../src/grammar.ts";
import type { PRule, RRule } from "../../src/parser/index.d.ts";
import { Tokens } from "./tokens.ts";
export class CodeblockGrammar extends Grammar {
      public override getGrammarTokens(): PRule[] {
            return [];
      }
      public override getReductionRules(): RRule[] {
            return [
                  { reduction: Tokens.CodeBlock, rule: [Tokens.LeftBracket, Tokens.ExpressionList, Tokens.RightBracket] },
            ];
      }
      public override convert(traverser:  Converter<Ir[]>): void {
            traverser
            .addRecursiveConversion(Tokens.CodeBlock, (self, token) => self.convert(token.$[1]))
      }
}