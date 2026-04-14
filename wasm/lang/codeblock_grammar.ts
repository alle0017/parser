import { Traverse } from "../../src/ast/traverse.ts";
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
      public override convert(traverser: Traverse): void {
            traverser
            .addRecursiveConversion(Tokens.CodeBlock, (self, token) => {
                  self.convert(token.$[1]);
            })
      }
}